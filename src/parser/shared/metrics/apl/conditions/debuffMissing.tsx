import type Spell from 'common/SPELLS/Spell';
import { SpellLink } from 'interface';
import { EventType, GetRelatedEvents, HasTarget } from 'parser/core/Events';
import { encodeEventTargetString, encodeTargetString } from 'parser/shared/modules/Enemies';

import { AplTriggerEvent, Condition, tenseAlt } from '../index';
import { validateBuffMissing } from './buffPresent';
import { buffDuration, DurationData, PandemicData } from './util';

export type TargetOptions = {
  /**
   * Link relation (see `EventLinkNormalizer`) to use for determining
   * targets on untargeted debuff-applying spells.
   *
   * When present, overrides any targets the event has.
   */
  targetLinkRelation?: string;
};

export function getTargets(event: AplTriggerEvent, targetLink?: string): string[] {
  if (targetLink) {
    return GetRelatedEvents(event, targetLink)
      .map(encodeEventTargetString)
      .filter((key): key is string => key !== null);
  } else if (HasTarget(event)) {
    return [encodeEventTargetString(event)!];
  } else {
    return [];
  }
}

/**
   The rule applies when the debuff `spell` is missing. The `optPandemic`
   parameter gives the ability to allow early refreshes to prevent a debuff
   dropping, but this will not *require* early refreshes.
 **/
export function debuffMissing(
  spell: Spell,
  optPandemic?: PandemicData,
  targetOptions?: TargetOptions,
): Condition<{ [key: string]: DurationData }> {
  return {
    key: `debuffMissing-${spell.id}`,
    init: () => ({}),
    update: (state, event) => {
      switch (event.type) {
        case EventType.RefreshDebuff:
        case EventType.ApplyDebuff:
          if (event.ability.guid === spell.id) {
            const encodedTargetString = encodeTargetString(event.targetID, event.targetInstance);
            state[encodedTargetString] = {
              referenceTime: event.timestamp,
              timeRemaining: optPandemic
                ? buffDuration(event.timestamp, state[encodedTargetString], optPandemic)
                : undefined,
            };

            return state;
          }
          break;
        case EventType.RemoveDebuff:
          if (event.ability.guid === spell.id) {
            const encodedTargetString = encodeTargetString(event.targetID, event.targetInstance);
            delete state[encodedTargetString];
            return state;
          }
          break;
      }

      return state;
    },
    validate: (state, event, ruleSpell) => {
      const targets = getTargets(event, targetOptions?.targetLinkRelation);
      if (targets.length === 0) {
        //No target so we can't check for a debuff
        return false;
      }

      return targets.some((encodedTargetString) =>
        validateBuffMissing(event, ruleSpell, state[encodedTargetString], optPandemic),
      );
    },
    describe: (tense) => (
      <>
        <SpellLink spell={spell.id} /> {tenseAlt(tense, 'is', 'was')} missing{' '}
        {optPandemic && <>or about to expire</>} from the target
      </>
    ),
  };
}
