import SPELLS from 'common/SPELLS';
import { formatDuration } from 'common/format';

import EventsNormalizer from 'Parser/Core/EventsNormalizer';

const debug = false;

class ApplyBuff extends EventsNormalizer {
  // We need to track `combatantinfo` events this way since they are included in the `events` passed to `normalize` due to technical reasons (it's a different API call). We still need `combatantinfo` for all players, so cache it manually.
  _combatantInfoEvents = [];
  initialize(combatants) {
    this._combatantInfoEvents = combatants;
  }

  _buffsAppliedByPlayerId = {};

  /**
   * Some buffs like Bloodlust and Holy Avenger when they are applied pre-combat it doesn't show up as an `applybuff` event nor in the `combatantinfo` buffs array. It can still be detected by looking for a `removebuff` event, this uses that to detect it and then fabricates an `applybuff` event at the start of the log.
   * @param {Array} events
   * @returns {Array}
   */
  normalize(events) {
    const firstEventIndex = this.getFightStartIndex(events);
    const playersById = this.owner.playersById;
    const playerId = this.owner.playerId;

    // region Buff event based detection
    // This catches most relevant buffs and is most accurate. If a player is good at juggling certain buffs they can achieve 100% uptime, if that happens `removebuff` is never called, so we also check for other indicators that are just as reliable, such as `applybuffstack`, `removebuffstack` and `refreshbuff`.
    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      const targetId = event.targetID;
      const sourceId = event.sourceID;

      // A player can have the same buff twice given that the buff was applied by someone else. Because we only want to fabricate buffs once, we use `_buffsAppliedByPlayerId` to ensure we don't do it twice, but because it doesn't track a source we can't track other people's buffs. And that's fine too since we only care about stuff by/to the player.
      if (![targetId, sourceId].includes(playerId)) {
        continue;
      }

      this._buffsAppliedByPlayerId[targetId] = this._buffsAppliedByPlayerId[targetId] || [];

      if (event.type === 'applybuff') {
        const spellId = event.ability.guid;
        this._buffsAppliedByPlayerId[targetId].push(spellId);
      }
      if (['removebuff', 'applybuffstack', 'removebuffstack', 'refreshbuff'].includes(event.type)) {
        const spellId = event.ability.guid;
        if (this._buffsAppliedByPlayerId[targetId].includes(spellId)) {
          // This buff has an `applybuff` event and so isn't broken :D
          continue;
        }

        const fightDuration = formatDuration((event.timestamp - this.owner.fight.start_time) / 1000);
        debug && console.warn(fightDuration, 'Found a buff on', ((playersById[targetId] && playersById[targetId].name) || '???'), 'that was applied before the pull:', event.ability.name, spellId, '! Fabricating an `applybuff` event so you don\'t have to do anything special to take this into account.');
        const targetInfo = this._combatantInfoEvents.find(combatantInfoEvent => combatantInfoEvent.sourceID === targetId);
        const applybuff = {
          // These are all the properties a normal `applybuff` event would have.
          timestamp: events[firstEventIndex].timestamp,
          type: 'applybuff',
          ability: event.ability,
          sourceID: sourceId,
          sourceIsFriendly: event.sourceIsFriendly,
          targetID: targetId,
          targetIsFriendly: event.targetIsFriendly,
          // Custom properties:
          prepull: true,
          __fabricated: true,
          // If we see a prepull buff from both its removebuff and in combatantinfo, we populate fabricated applybuff from the removebuff because this requires us to make up fewer fields. We still need to mark it as in the combatantinfo.
          __fromCombatantinfo: targetInfo && targetInfo.auras && targetInfo.auras.some(aura => aura.ability === spellId),
        };

        events.splice(firstEventIndex, 0, applybuff);
        // It shouldn't happen twice, but better be safe than sorry.
        this._buffsAppliedByPlayerId[targetId].push(spellId);
      }
    }
    // endregion

    // region `combatantinfo` based detection
    // This catches buffs that never drop, such as Flasks and more importantly Atonements and Beacons.
    this._combatantInfoEvents.forEach(event => {
      const targetId = event.sourceID;
      // event.auras can be undefined if combatantinfo for any player in the fight errored
      event.auras && event.auras.forEach(aura => {
        const spellId = aura.ability;
        const sourceId = aura.source;

        // A player can have the same buff twice given that the buff was applied by someone else. Because we only want to fabricate buffs once, we use `_buffsAppliedByPlayerId` to ensure we don't do it twice, but because it doesn't track a source we can't track other people's buffs. And that's fine too since we only care about stuff by/to the player.
        if (![targetId, sourceId].includes(playerId)) {
          return;
        }

        this._buffsAppliedByPlayerId[targetId] = this._buffsAppliedByPlayerId[targetId] || [];

        if (this._buffsAppliedByPlayerId[targetId].includes(spellId)) {
          // This buff has an `applybuff` event and so isn't broken :D
          return;
        }

        debug && console.warn('Found a buff on', ((playersById[targetId] && playersById[targetId].name) || '???'), 'in the combatantinfo that was applied before the pull and never dropped:', (SPELLS[spellId] && SPELLS[spellId].name) || '???', spellId, '! Fabricating an `applybuff` event so you don\'t have to do anything special to take this into account.');
        const applybuff = {
          // These are all the properties a normal `applybuff` event would have.
          timestamp: events[firstEventIndex].timestamp,
          type: 'applybuff',
          ability: {
            guid: spellId,
            name: SPELLS[spellId] ? SPELLS[spellId].name : 'Unknown',
            abilityIcon: aura.icon,
          },
          sourceID: sourceId,
          sourceIsFriendly: true,
          targetID: targetId,
          targetIsFriendly: true,
          // Custom properties:
          prepull: true,
          __fabricated: true,
          __fromCombatantinfo: true,
        };
        events.splice(firstEventIndex, 0, applybuff);
        // It shouldn't happen twice, but better be safe than sorry.
        this._buffsAppliedByPlayerId[targetId].push(spellId);
      });
    });
    // We don't need it anymore, this might introduce a crash if this method is ever called twice, but we're under the presumption that never happens so if it does crash we might have to verify if everything works properly with this behavior.
    this._combatantInfoEvents = undefined;
    // endregion

    return events;
  }
}

export default ApplyBuff;
