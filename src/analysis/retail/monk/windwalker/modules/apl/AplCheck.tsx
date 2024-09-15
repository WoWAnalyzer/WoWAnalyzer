import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/monk';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, { build, CheckResult, PlayerInfo } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import { AplRuleProps } from 'parser/shared/metrics/apl/ChecklistRule';
import { and, buffMissing, hasResource, hasTalent } from 'parser/shared/metrics/apl/conditions';

const needsFaelineHarmony = and(
  hasTalent(TALENTS.JADEFIRE_HARMONY_TALENT),
  buffMissing(SPELLS.FAELINE_HARMONY_BUFF),
);

const hasChi = (min: number) => hasResource(RESOURCE_TYPES.CHI, { atLeast: min });

export const nonSerenityApl = build([
  {
    spell: TALENTS.JADEFIRE_STOMP_TALENT,
    condition: needsFaelineHarmony,
  },
  {
    spell: TALENTS.STRIKE_OF_THE_WINDLORD_TALENT,
    condition: hasChi(2),
  },
  /*
    TALENTS.WHIRLING_DRAGON_PUNCH_TALENT,
    {
      spell: TALENTS.RISING_SUN_KICK_TALENT,
      condition: and(buffPresent(SPELLS.PRESSURE_POINT_BUFF), hasChi(2)),
    },
    {
      spell: TALENTS.FISTS_OF_FURY_TALENT,
      condition: hasChi(3),
    },
    {
      spell: TALENTS.RISING_SUN_KICK_TALENT,
      condition: hasChi(2),
    },
    {
      spell: SPELLS.SPINNING_CRANE_KICK,
      condition: buffPresent(SPELLS.DANCE_OF_CHI_JI_BUFF),
    },
    {
      spell: SPELLS.BLACKOUT_KICK,
      condition: describe(and(hasChi(1), not(lastSpellCast(SPELLS.BLACKOUT_KICK))), (tense) => (
        <>
          <SpellLink spell={SPELLS.BLACKOUT_KICK} /> was not your last cast.
        </>
      )),
    },
    TALENTS.CHI_WAVE_TALENT,
    */
]);

export const nonSerenityProps = (events: AnyEvent[], info: PlayerInfo): AplRuleProps => {
  const check = aplCheck(nonSerenityApl);
  return {
    apl: nonSerenityApl,
    checkResults: check(events, info),
  };
};

export const checkNonSerenity = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(nonSerenityApl);
  return check(events, info);
};

export default suggestion((events, info) => {
  const { violations } = checkNonSerenity(events, info);
  annotateTimeline(violations);

  return undefined;
});
