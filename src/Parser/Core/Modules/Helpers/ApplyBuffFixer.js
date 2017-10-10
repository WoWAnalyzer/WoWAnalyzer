import { formatDuration } from 'common/format';

import Module from 'Parser/Core/Module';

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
  _getSelectedCombatant(events) {
    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      if (event.type === 'combatantinfo' && event.sourceID === this.owner.playerId) {
        return event;
      }
    }
    throw new Error('Fight doesn\'t have a selected combatant, something must have gone wrong.');
  }

  _buffsApplied = [];

  /**
   * Some buffs like Bloodlust and Holy Avenger when they are applied pre-combat it doesn't show up as an `applybuff` event nor in the `combatantinfo` buffs array. It can still be detected by looking for a `removebuff` event, this uses that to detect it and then fabricates an `applybuff` event at the start of the log.
   * @param {Array} events
   * @returns {Array}
   */
  reorderEvents(events) {
    const firstEventIndex = this._getFirstEventIndex(events);

    // region `removebuff` based detection
    // This catches most relevant buffs and is most accurate.
    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];

      if (event.targetID !== this.owner.playerId) {
        // We don't receive most events for other players (only those we cast ourselves), so we wouldn't be able to detect this properly.
        continue;
      }

      if (event.type === 'applybuff') {
        this._buffsApplied.push(event.ability.guid);
      }
      if (event.type === 'removebuff') {
        if (this._buffsApplied.includes(event.ability.guid)) {
          // This buff has an `applybuff` event and so isn't broken :D
          continue;
        }

        const fightDuration = formatDuration((event.timestamp - this.owner.fight.start_time) / 1000);
        console.warn(fightDuration, 'Found a buff that was applied before the pull:', event.ability.name, event.ability.guid, '! Fabricating an `applybuff` event so you don\'t have to do anything special to take this into account.');
        const applybuff = {
          // These are all the properties a normal `applybuff` event would have.
          timestamp: events[firstEventIndex].timestamp,
          type: 'applybuff',
          ability: event.ability,
          sourceID: event.sourceID,
          sourceIsFriendly: event.sourceIsFriendly,
          targetID: event.targetID,
          targetIsFriendly: event.targetIsFriendly,
          // Custom properties:
          prepull: true,
          __fabricated: true,
        };
        events.splice(firstEventIndex, 0, applybuff);
        // It shouldn't happen twice, but better be safe than sorry.
        this._buffsApplied.push(event.ability.guid);
      }
    }
    // endregion

    // region `combatantinfo` based detection
    // This catches buffs that never drop, such as Flasks and more importantly.

    // I do NOT want to rely on the Combatants module to avoid that dependency interfering with the priority of this class. This check is simple enough here so it doesn't matter much and so choosing the more robust solution makes sense.
    const combatant = this._getSelectedCombatant(events);

    combatant.auras.forEach(aura => {
      if (this._buffsApplied.includes(aura.ability)) {
        // This buff has an `applybuff` event and so isn't broken :D
        return;
      }

      console.warn('Found a buff in the combatantinfo that was applied before the pull and never dropped:', aura.ability, '! Fabricating an `applybuff` event so you don\'t have to do anything special to take this into account.');
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
        targetID: combatant.sourceID,
        targetIsFriendly: true,
        // Custom properties:
        prepull: true,
        __fabricated: true,
      };
      events.splice(firstEventIndex, 0, applybuff);
    });
    // endregion

    return events;
  }
}

export default ApplyBuffFixer;
