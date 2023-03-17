import aplCheck, { build, Condition } from 'parser/shared/metrics/apl';
import {
  and,
  buffMissing,
  buffPresent,
  describe,
  hasResource,
  lastSpellCast,
  not,
  or,
} from 'parser/shared/metrics/apl/conditions';
import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import TALENTS from 'common/TALENTS/monk';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';

const serenityOr = (cond: Condition<any>) => or(cond, buffPresent(TALENTS.SERENITY_TALENT));

const hasChi = (min: number) => hasResource(RESOURCE_TYPES.CHI, { atLeast: min });

export const apl = build([
  {
    spell: TALENTS.FAELINE_STOMP_TALENT,
    condition: buffMissing(TALENTS.FAELINE_HARMONY_TALENT),
  },
  {
    spell: TALENTS.STRIKE_OF_THE_WINDLORD_TALENT,
    condition: serenityOr(hasChi(2)),
  },
  TALENTS.WHIRLING_DRAGON_PUNCH_TALENT,
  {
    spell: TALENTS.RISING_SUN_KICK_TALENT,
    condition: and(buffPresent(SPELLS.PRESSURE_POINT_BUFF), serenityOr(hasChi(2))),
  },
  {
    spell: TALENTS.FISTS_OF_FURY_TALENT,
    condition: serenityOr(hasChi(3)),
  },
  {
    spell: TALENTS.RISING_SUN_KICK_TALENT,
    condition: serenityOr(hasChi(2)),
  },
  {
    spell: SPELLS.SPINNING_CRANE_KICK,
    condition: buffPresent(TALENTS.DANCE_OF_CHI_JI_TALENT),
  },
  {
    spell: SPELLS.BLACKOUT_KICK,
    condition: describe(
      and(serenityOr(hasChi(1)), not(lastSpellCast(SPELLS.BLACKOUT_KICK))),
      (tense) => (
        <>
          <SpellLink id={SPELLS.BLACKOUT_KICK} /> was not your last cast.
        </>
      ),
    ),
  },
  TALENTS.RUSHING_JADE_WIND_TALENT,
  TALENTS.CHI_WAVE_TALENT,
  TALENTS.FAELINE_STOMP_TALENT,
  {
    spell: TALENTS.CHI_BURST_TALENT,
    condition: and(
      buffMissing(TALENTS.SERENITY_TALENT),
      hasResource(RESOURCE_TYPES.CHI, { atMost: 5 }),
    ),
  },
]);

export const check = aplCheck(apl);

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});
