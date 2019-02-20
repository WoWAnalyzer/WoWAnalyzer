import SPELLS from 'common/SPELLS';

import EventsNormalizer from 'parser/core/EventsNormalizer';

const debug = false;

/**
 * Some buffs like Bloodlust and Holy Avenger when they are applied pre-combat it doesn't show up as an `applybuff` event, but the CombatantInfoAuras normalizer puts it in the `combatantinfo` buffs array. This uses that to detect prepull buffs and then fabricates an `applybuff` event at the start of the log.
 * Unless Blizzard introduces some bug in the future, we can be sure that none of the buffs in the `combatantinfo.auras` prop have an `applybuff` event. So we don't have to check for that.
 */
class ApplyBuff extends EventsNormalizer {
  normalize(events) {
    const firstEventIndex = this.getFightStartIndex(events);
    const firstStartTimestamp = this.owner.fight.start_time;
    const playersById = this.owner.playersById;

    this.owner.combatantInfoEvents.forEach(event => {
      const targetId = event.sourceID;
      event.auras.forEach(aura => {
        const spellId = aura.ability;
        const sourceId = aura.source;
        const extra = aura.__extra;

        debug && console.warn('Found a buff on', ((playersById[targetId] && playersById[targetId].name) || '???'), 'in the combatantinfo that was applied before the pull:', (SPELLS[spellId] && SPELLS[spellId].name) || '???', spellId, '! Fabricating an `applybuff` event so you don\'t have to do anything special to take this into account.');
        const applybuff = {
          // These are all the properties a normal `applybuff` event would have.
          timestamp: firstStartTimestamp,
          type: 'applybuff',
          ability: extra ? extra.ability : {
            guid: spellId,
            name: SPELLS[spellId] ? SPELLS[spellId].name : 'Unknown',
            abilityIcon: aura.icon,
          },
          sourceID: sourceId,
          sourceIsFriendly: extra ? extra.sourceIsFriendly : true,
          targetID: targetId,
          targetIsFriendly: extra ? extra.targetIsFriendly : true,
          // Custom properties:
          prepull: true,
          __fabricated: true,
        };
        events.splice(firstEventIndex, 0, applybuff);
      });
    });

    return events;
  }
}

export default ApplyBuff;
