import { Condition, tenseAlt } from 'parser/shared/metrics/apl';
import TALENTS from 'common/TALENTS/monk';
import { EventType } from 'parser/core/Events';
import { SpellLink } from 'interface';
import { CHI_SPENDERS } from 'analysis/retail/monk/windwalker/constants';

const DRINKING_HORN_COVER_DURATION_INCR = 300;
const SERENITY_BASE_DURATION = 12000;

export function serenityDurationRemainingLT(
  durationLessThan: number,
): Condition<number | undefined> {
  let hasDrinkingHornCover: boolean;
  return {
    key: `serenity-duration-remaining`,
    init: (info) => {
      hasDrinkingHornCover = info.combatant.hasTalent(TALENTS.DRINKING_HORN_COVER_TALENT);
      return undefined;
    },
    update: (state, event) => {
      switch (event.type) {
        case EventType.ApplyBuff:
          if (event.ability.guid === TALENTS.SERENITY_TALENT.id) {
            return event.timestamp + SERENITY_BASE_DURATION;
          }
          break;
        case EventType.RemoveBuff:
          if (event.ability.guid === TALENTS.SERENITY_TALENT.id) {
            return undefined;
          }
          break;
        case EventType.Cast:
          if (
            hasDrinkingHornCover &&
            state !== undefined &&
            CHI_SPENDERS.some((spell) => spell.id === event.ability.guid)
          ) {
            return state + DRINKING_HORN_COVER_DURATION_INCR;
          }
      }

      return state;
    },
    validate: (state, event, ruleSpell) => {
      return (
        state !== undefined && state > event.timestamp && state - event.timestamp < durationLessThan
      );
    },
    describe: (tense) => (
      <>
        <SpellLink id={TALENTS.SERENITY_TALENT.id} /> {tenseAlt(tense, 'is', 'was')} within the last{' '}
        {durationLessThan / 1000} seconds of its duration
      </>
    ),
  };
}
