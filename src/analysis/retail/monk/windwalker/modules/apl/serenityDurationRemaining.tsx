import { Condition, tenseAlt } from 'parser/shared/metrics/apl';
import TALENTS from 'common/TALENTS/monk';
import SPELLS from 'common/SPELLS/monk';
import { EventType } from 'parser/core/Events';
import { SpellLink } from 'interface';

const DRINKING_HORN_COVER_DURATION_INCR = 300;
const SERENITY_BASE_DURATION = 12000;
const CHI_SPENDER_IDS = [
  SPELLS.BLACKOUT_KICK.id,
  TALENTS.RISING_SUN_KICK_TALENT.id,
  SPELLS.SPINNING_CRANE_KICK.id,
  TALENTS.FISTS_OF_FURY_TALENT.id,
  TALENTS.STRIKE_OF_THE_WINDLORD_TALENT.id,
  TALENTS.RUSHING_JADE_WIND_TALENT.id,
];
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
            CHI_SPENDER_IDS.includes(event.ability.guid)
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
