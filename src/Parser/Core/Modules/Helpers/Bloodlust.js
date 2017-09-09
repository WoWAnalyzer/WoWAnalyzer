import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

export const BLOODLUST_BUFF_IDS = [
  SPELLS.HEROISM.id,
  SPELLS.BLOODLUST.id,
  SPELLS.TIME_WARP.id,
  SPELLS.NETHERWINDS.id,
  SPELLS.ANCIENT_HYSTERIA.id,
  SPELLS.DRUMS_OF_FURY.id,
  SPELLS.DRUMS_OF_RAGE.id,
  SPELLS.DRUMS_OF_THE_MOUNTAIN.id,
];

class Bloodlust extends Module {
  /**
   * When Bloodlust is applied pre-combat it doesn't show up as an `applybuff` event nor in the `combatantinfo` buffs array. It can still be detected by looking for a `removebuff` event, this uses that to detect it and then fabricates an `applybuff` event at the start of the log.
   * @param {Array} events
   * @returns {Array}
   */
  reorderEvents(events) {
    let firstEventIndex = null;
    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      if (firstEventIndex === null && event.type !== 'combatantinfo') {
        firstEventIndex = i;
      }

      // Only fix Bloodlust when the `targetID` is the selected player. The reason for this is the situation that everyone got BL pre-combat, but the selected player casts another Bloodlust, in this situation the applybuff event will be called but not for applying Bloodlust to the player so it's not valid.
      if (event.type === 'applybuff' && BLOODLUST_BUFF_IDS.indexOf(event.ability.guid) !== -1 && event.targetID === this.owner.playerId) {
        break; // We can break here since the applybuff event happened before the removebuff, so it wasn't a pre-combat BL.
      } else if (event.type === 'removebuff' && BLOODLUST_BUFF_IDS.indexOf(event.ability.guid) !== -1 && event.targetID === this.owner.playerId) {
        // Fabricate an applybuff for the bloodlust event and insert it before firstEventIndex

        const applybuff = {
          timestamp: events[firstEventIndex].timestamp,
          type: 'applybuff',
          sourceID: event.sourceID,
          sourceIsFriendly: true,
          targetID: event.targetID,
          targetIsFriendly: true,
          ability: event.ability,
        };
        events.splice(firstEventIndex, 0, applybuff);
        break; // the issue can only occur once.
      }
    }
    return events;
  }
}

export default Bloodlust;
