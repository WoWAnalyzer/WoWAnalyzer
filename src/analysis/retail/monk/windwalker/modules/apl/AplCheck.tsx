import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/monk';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import { suggestion } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import aplCheck, {
  build,
  CheckResult,
  Condition,
  PlayerInfo,
  Rule,
} from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import { AplRuleProps } from 'parser/shared/metrics/apl/ChecklistRule';
import {
  and,
  buffMissing,
  buffPresent,
  describe,
  hasResource,
  hasTalent,
  lastSpellCast,
  not,
} from 'parser/shared/metrics/apl/conditions';

const inSerenity = buffPresent(TALENTS.SERENITY_TALENT);
inSerenity.describe = (tense) => '';
const notSerenity = not(inSerenity);
notSerenity.describe = (tense) => '';
const andSerenity = (cond: Condition<any>) => {
  const andCnd = and(inSerenity, cond);
  andCnd.describe = cond.describe;
  return andCnd;
};
const andNotSerenity = (cond: Condition<any>) => {
  const andCnd = and(not(inSerenity), cond);
  andCnd.describe = cond.describe;
  return andCnd;
};

const needsFaelineHarmony = and(
  hasTalent(TALENTS.FAELINE_HARMONY_TALENT),
  buffMissing(SPELLS.FAELINE_HARMONY_BUFF),
);

inSerenity.describe = (tense) => '';
const hasChi = (min: number) => hasResource(RESOURCE_TYPES.CHI, { atLeast: min });

export const serenityApl = build(
  [
    {
      spell: TALENTS.FAELINE_STOMP_TALENT,
      condition: needsFaelineHarmony,
    },
    TALENTS.STRIKE_OF_THE_WINDLORD_TALENT,
    TALENTS.FISTS_OF_FURY_TALENT,
    TALENTS.RISING_SUN_KICK_TALENT,
    SPELLS.BLACKOUT_KICK,
    {
      spell: SPELLS.SPINNING_CRANE_KICK,
      condition: buffPresent(SPELLS.DANCE_OF_CHI_JI_BUFF),
    },
    TALENTS.CHI_WAVE_TALENT,
  ].map((rule: Rule) => {
    if ('condition' in rule) {
      return { spell: rule.spell, condition: andSerenity(rule.condition) };
    }
    if ('description' in rule) {
      return { ...rule, condition: inSerenity };
    }
    return { spell: rule, condition: inSerenity };
  }),
);

export const nonSerenityApl = build(
  [
    {
      spell: TALENTS.FAELINE_STOMP_TALENT,
      condition: needsFaelineHarmony,
    },
    {
      spell: TALENTS.STRIKE_OF_THE_WINDLORD_TALENT,
      condition: hasChi(2),
    },
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
    {
      spell: TALENTS.RUSHING_JADE_WIND_TALENT,
      condition: hasChi(1),
    },
    TALENTS.CHI_WAVE_TALENT,
    TALENTS.FAELINE_STOMP_TALENT,
    {
      spell: TALENTS.CHI_BURST_TALENT,
      condition: and(
        buffMissing(TALENTS.SERENITY_TALENT),
        hasResource(RESOURCE_TYPES.CHI, { atMost: 5 }),
      ),
    },
  ].map((rule: Rule) => {
    if ('condition' in rule) {
      return { spell: rule.spell, condition: andNotSerenity(rule.condition) };
    }
    if ('description' in rule) {
      return { ...rule, condition: notSerenity };
    }
    return { spell: rule, condition: notSerenity };
  }),
);

export const serenityProps = (events: AnyEvent[], info: PlayerInfo): AplRuleProps => {
  const check = aplCheck(serenityApl);
  return {
    apl: serenityApl,
    checkResults: check(events, info),
  };
};

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

export const checkSerenity = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(serenityApl);
  return check(events, info);
};

export default suggestion((events, info) => {
  const checkSerenity = aplCheck(serenityApl);
  const checkNonSerenity = aplCheck(nonSerenityApl);
  const violations = checkSerenity(events, info).violations.concat(
    checkNonSerenity(events, info).violations,
  );
  annotateTimeline(violations);

  return undefined;
});
