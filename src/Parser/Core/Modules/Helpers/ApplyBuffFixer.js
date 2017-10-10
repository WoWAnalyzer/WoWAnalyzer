import SPELLS from 'common/SPELLS';
import { formatDuration } from 'common/format';

import Module from 'Parser/Core/Module';

const debug = false;

class ApplyBuffFixer extends Module {
  _getFirstEventIndex(events) {
    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      if (event.type !== 'combatantinfo') {
        return i;
      }
    }
    throw new Error('Fight doesn\'t have a first event, something must have gone wrong.');
  }

  _initialized = false;
  on_initialized() {
    this._initialized = true;
  }
  // We need to track `combatantinfo` events this way since they are included in the `events` passed to `reorderEvents` due to technical reasons (it's a different API call). We still need `combatantinfo` for all players, so cache it manually.
  _combatantInfoEvents = [];
  on_combatantinfo(event) {
    if (!this._initialized) {
      // Stop after initialization to avoid parsing the player twice, and this fixes a crash since the selected player's `combatantinfo` is received after `reorderEvents()`
      this._combatantInfoEvents.push(event);
    }
  }

  _buffsAppliedByPlayerId = {};

  /**
   * Some buffs like Bloodlust and Holy Avenger when they are applied pre-combat it doesn't show up as an `applybuff` event nor in the `combatantinfo` buffs array. It can still be detected by looking for a `removebuff` event, this uses that to detect it and then fabricates an `applybuff` event at the start of the log.
   * @param {Array} events
   * @returns {Array}
   */
  reorderEvents(events) {
    const firstEventIndex = this._getFirstEventIndex(events);
    const playersById = this.owner.playersById;

    // region Buff event based detection
    // This catches most relevant buffs and is most accurate. If a player is good at juggling certain buffs they can achieve 100% uptime, if that happens `removebuff` is never called, so we also check for other indicators that are just as reliable, such as `applybuffstack`, `removebuffstack` and `refreshbuff`.
    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      const targetId = event.targetID;

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
        const applybuff = {
          // These are all the properties a normal `applybuff` event would have.
          timestamp: events[firstEventIndex].timestamp,
          type: 'applybuff',
          ability: event.ability,
          sourceID: event.sourceID,
          sourceIsFriendly: event.sourceIsFriendly,
          targetID: targetId,
          targetIsFriendly: event.targetIsFriendly,
          // Custom properties:
          prepull: true,
          __fabricated: true,
        };
        events.splice(firstEventIndex, 0, applybuff);
        // It shouldn't happen twice, but better be safe than sorry.
        this._buffsAppliedByPlayerId[targetId].push(spellId);
      }
    }
    // endregion

    // region `combatantinfo` based detection
    // This catches buffs that never drop, such as Flasks and more importantly.
    this._combatantInfoEvents.forEach(event => {
      const targetId = event.sourceID;
      event.auras.forEach(aura => {
        const spellId = aura.ability;

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
            name: 'Unknown',
            abilityIcon: aura.icon,
          },
          sourceID: aura.source,
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

export default ApplyBuffFixer;
