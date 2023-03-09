import { SpellLink } from 'interface';
import { EventType, HasTarget } from 'parser/core/Events';
import { encodeEventTargetString, encodeTargetString } from 'parser/shared/modules/Enemies';
import { AplTriggerEvent, Condition, tenseAlt } from 'parser/shared/metrics/apl/index';
import { validateBuffMissing } from 'parser/shared/metrics/apl/conditions/buffPresent';
import { DurationData, PandemicData } from 'parser/shared/metrics/apl/conditions/util/index';
import getResourceSpent from 'parser/core/getResourceSpent';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { getHardcast } from '../../normalizers/CastLinkNormalizer';
import SPELLS from 'common/SPELLS';

function getTargets(event: AplTriggerEvent): string[] {
  if (HasTarget(event)) {
    return [encodeEventTargetString(event)!];
  } else {
    return [];
  }
}

const BTE_ID = SPELLS.BETWEEN_THE_EYES.id;
const BTE_TIME_PER_CP_SPENT = 3000;
const BTE_PANDEMICDATA: PandemicData = {
  timeRemaining: 6000,
  duration: 0,
  pandemicCap: 1,
};

export function betweenTheEyesMissing(): Condition<{ [key: string]: DurationData }> {
  return {
    key: `debuffMissing-${BTE_ID}`,
    init: () => ({}),
    update: (state, event) => {
      switch (event.type) {
        case EventType.RefreshDebuff:
        case EventType.ApplyDebuff:
          if (event.ability.guid === BTE_ID) {
            const encodedTargetString = encodeTargetString(event.targetID, event.targetInstance);
            const castEvent = getHardcast(event)!;
            const cpSpent = getResourceSpent(castEvent, RESOURCE_TYPES.COMBO_POINTS);
            state[encodedTargetString] = {
              referenceTime: event.timestamp,
              timeRemaining: cpSpent * BTE_TIME_PER_CP_SPENT,
            };

            return state;
          }
          break;
        case EventType.RemoveDebuff:
          if (event.ability.guid === BTE_ID) {
            const encodedTargetString = encodeTargetString(event.targetID, event.targetInstance);
            delete state[encodedTargetString];
            return state;
          }
          break;
      }

      return state;
    },
    validate: (state, event, ruleSpell) => {
      const targets = getTargets(event);
      if (targets.length === 0) {
        //No target so we can't check for a debuff
        return false;
      }

      return targets.some((encodedTargetString) =>
        validateBuffMissing(event, ruleSpell, state[encodedTargetString], BTE_PANDEMICDATA),
      );
    },
    describe: (tense) => (
      <>
        <SpellLink id={BTE_ID} /> {tenseAlt(tense, 'is', 'was')} missing or about to expire from the
        target
      </>
    ),
  };
}
