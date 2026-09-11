import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import { EventType } from 'parser/core/Events';

import { Condition, tenseAlt } from '../index';

/**
 * Tracks any Bloodlust-family haste buff as an APL condition.
 */
export default function inBloodlust(): Condition<boolean> {
  let playerId: number;
  return {
    key: 'inBloodlust',
    init: (info) => {
      playerId = info.playerId;
      return info.combatant.inBloodlust();
    },
    update: (state, event) => {
      switch (event.type) {
        case EventType.ApplyBuff:
          return event.targetID === playerId && event.ability.guid in BLOODLUST_BUFFS
            ? true
            : state;
        case EventType.RemoveBuff:
          return event.targetID === playerId && event.ability.guid in BLOODLUST_BUFFS
            ? false
            : state;
        default:
          return state;
      }
    },
    validate: (state) => state,
    describe: (tense) => <>you {tenseAlt(tense, 'are', 'were')} in Bloodlust</>,
  };
}
