import aplCheck, { build, PlayerInfo, Rule } from 'parser/shared/metrics/apl';
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
import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import TALENTS from 'common/TALENTS/monk';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import { AnyEvent } from 'parser/core/Events';
import { serenityDurationRemainingLT } from 'analysis/retail/monk/windwalker/modules/apl/serenityDurationRemaining';
import { AplRuleProps } from 'parser/shared/metrics/apl/ChecklistRule';

const inSerenity = buffPresent(TALENTS.SERENITY_TALENT);
const hasChi = (min: number) => hasResource(RESOURCE_TYPES.CHI, { atLeast: min });

export const serenityApl = build(
  [
    {
      spell: TALENTS.FISTS_OF_FURY_TALENT,
      condition: serenityDurationRemainingLT(1500),
    },
    {
      spell: TALENTS.FAELINE_STOMP_TALENT,
      condition: and(
        hasTalent(TALENTS.FAELINE_HARMONY_TALENT),
        buffMissing(SPELLS.FAELINE_HARMONY_BUFF),
      ),
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
      return { spell: rule.spell, condition: and(rule.condition, inSerenity) };
    }
    return { spell: rule, condition: inSerenity };
  }),
);

export const nonSerenityApl = build(
  [
    {
      spell: TALENTS.FAELINE_STOMP_TALENT,
      condition: and(
        hasTalent(TALENTS.FAELINE_HARMONY_TALENT),
        buffMissing(SPELLS.FAELINE_HARMONY_BUFF),
      ),
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
          <SpellLink id={SPELLS.BLACKOUT_KICK} /> was not your last cast.
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
      return { spell: rule.spell, condition: and(rule.condition, not(inSerenity)) };
    }
    return { spell: rule, condition: not(inSerenity) };
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

export default suggestion((events, info) => {
  const checkSerenity = aplCheck(serenityApl);
  const checkNonSerenity = aplCheck(nonSerenityApl);
  const violations = checkSerenity(events, info).violations.concat(
    checkNonSerenity(events, info).violations,
  );
  annotateTimeline(violations);

  return undefined;
});
