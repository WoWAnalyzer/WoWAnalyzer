import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { EventType, HasTarget } from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/Enemies';

import { Condition, tenseAlt } from '../index';
import { buffDuration, DurationData, PandemicData } from './util';

/**
   The rule applies when the debuff `spell` is missing. The `optPandemic`
   parameter gives the ability to allow early refreshes to prevent a debuff
   dropping, but this will not *require* early refreshes.
 **/
export function debuffMissing(
  spell: Spell,
  optPandemic?: PandemicData,
): Condition<{ [key: string]: DurationData } | null> {
  const pandemic: PandemicData = {
    timeRemaining: 0,
    duration: 0,
    ...optPandemic,
  };

  return {
    key: `debuffMissing-${spell.id}`,
    init: () => null,
    update: (state, event) => {
      switch (event.type) {
        case EventType.ApplyDebuff:
          if (event.ability.guid === spell.id) {
            const encodedTargetString = encodeTargetString(
              event.targetID,
              event.targetInstance ?? 1,
            );
            if (!state) {
              state = {};
            }
            state[encodedTargetString] = {
              referenceTime: event.timestamp,
              timeRemaining: buffDuration(state[encodedTargetString]?.timeRemaining, pandemic),
            };

            return state;
          }
          break;
        case EventType.RemoveDebuff:
          if (event.ability.guid === spell.id) {
            const encodedTargetString = encodeTargetString(
              event.targetID,
              event.targetInstance ?? 1,
            );
            if (!state) {
              state = {};
            }
            delete state[encodedTargetString];
            return state;
          }
          break;
      }

      return state;
    },
    validate: (state, event, ruleSpell) => {
      if (!HasTarget(event)) {
        //No target so can't have debuff
        return false;
      }
      const encodedTargetString = encodeTargetString(event.targetID, event.targetInstance ?? 1);
      if (state === null || state[encodedTargetString] === undefined) {
        // debuff is missing
        return true;
      } else if (state[encodedTargetString]?.referenceTime + 200 > event.timestamp) {
        // debuff was *just* applied, possibly by this very spell. treat it as optional
        return event.ability.guid === ruleSpell.id;
      } else {
        // otherwise, return true if we can pandemic this debuff
        return (
          ruleSpell.id === event.ability.guid &&
          state[encodedTargetString].referenceTime + state[encodedTargetString].timeRemaining <
            event.timestamp + pandemic.timeRemaining
        );
      }
    },
    describe: (tense) => (
      <>
        <SpellLink id={spell.id} /> {tenseAlt(tense, 'is', 'was')} missing{' '}
        {optPandemic && <>or about to expire</>} from the target
      </>
    ),
  };
}
