import { formatDuration } from 'common/format';

import Module from 'Parser/Core/Module';

const debug = true;

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

  _buffsAppliedByPlayerId = {};

  /**
   * Some buffs like Bloodlust and Holy Avenger when they are applied pre-combat it doesn't show up as an `applybuff` event nor in the `combatantinfo` buffs array. It can still be detected by looking for a `removebuff` event, this uses that to detect it and then fabricates an `applybuff` event at the start of the log.
   * @param {Array} events
   * @returns {Array}
   */
  reorderEvents(events) {
    const firstEventIndex = this._getFirstEventIndex(events);
    const playersById = this.owner.playersById;

    // region `removebuff` based detection
    // This catches most relevant buffs and is most accurate.
    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      const targetId = event.targetID;

      this._buffsAppliedByPlayerId[targetId] = this._buffsAppliedByPlayerId[targetId] || [];

      if (event.type === 'applybuff') {
        this._buffsAppliedByPlayerId[targetId].push(event.ability.guid);
      }
      if (event.type === 'removebuff') {
        if (this._buffsAppliedByPlayerId[targetId].includes(event.ability.guid)) {
          // This buff has an `applybuff` event and so isn't broken :D
          continue;
        }

        const fightDuration = formatDuration((event.timestamp - this.owner.fight.start_time) / 1000);
        debug && console.warn(fightDuration, 'Found a buff on', ((playersById[targetId] && playersById[targetId].name) || '???'), 'that was applied before the pull:', event.ability.name, event.ability.guid, '! Fabricating an `applybuff` event so you don\'t have to do anything special to take this into account.');
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
        this._buffsAppliedByPlayerId[targetId].push(event.ability.guid);
      }
    }
    // endregion

    // region `refreshbuff` based detection
    // If a player is good at juggling certian buffs they can achieve 100% uptime, no `removebuff` will be triggered but knowing about them is still important.
    // TODO: Implement
    // endregion

    // region `combatantinfo` based detection
    // This catches buffs that never drop, such as Flasks and more importantly.

    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      if (event.type === 'combatantinfo') {
        event.auras.forEach(aura => {
          const targetId = event.sourceID;

          this._buffsAppliedByPlayerId[targetId] = this._buffsAppliedByPlayerId[targetId] || [];

          if (this._buffsAppliedByPlayerId[targetId].includes(aura.ability)) {
            // This buff has an `applybuff` event and so isn't broken :D
            return;
          }

          debug && console.warn('Found a buff on', ((playersById[targetId] && playersById[targetId].name) || '???'), 'in the combatantinfo that was applied before the pull and never dropped:', aura.ability, '! Fabricating an `applybuff` event so you don\'t have to do anything special to take this into account.');
          const applybuff = {
            // These are all the properties a normal `applybuff` event would have.
            timestamp: events[firstEventIndex].timestamp,
            type: 'applybuff',
            ability: {
              id: aura.ability,
              name: 'Unknown',
              icon: aura.icon,
            },
            sourceID: aura.source,
            sourceIsFriendly: true,
            targetID: targetId,
            targetIsFriendly: true,
            // Custom properties:
            prepull: true,
            __fabricated: true,
          };
          events.splice(firstEventIndex, 0, applybuff);
        });
      }
    }
    // endregion

    return events;
  }
}

export default ApplyBuffFixer;
