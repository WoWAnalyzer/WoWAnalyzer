import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, tenseAlt } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import * as mwCnd from './conditions';
import talents, { TALENTS_MONK } from 'common/TALENTS/monk';
import { AnyEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AOE_SCK = {
  spell: SPELLS.SPINNING_CRANE_KICK,
  condition: cnd.and(
    cnd.targetsHit(
      { atLeast: 4 },
      {
        targetSpell: SPELLS.SPINNING_CRANE_KICK_DAMAGE,
      },
    ),
    cnd.hasTalent(talents.AWAKENED_FAELINE_TALENT),
  ),
};

const SHEILUNS_SHAOHAOS = {
  spell: talents.SHEILUNS_GIFT_TALENT,
  condition: cnd.optionalRule(
    cnd.buffStacks(SPELLS.SHEILUN_CLOUD_BUFF, { atLeast: 4, atMost: 10 }),
  ),
};

const VIVIFY_8_REMS = {
  spell: SPELLS.VIVIFY,
  condition: cnd.describe(
    mwCnd.targetsHealed(
      { atLeast: 9 }, // 8 rems + 1 primary target
    ),
    (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} 8 active{' '}
        <SpellLink spell={talents.RENEWING_MIST_TALENT} />
      </>
    ),
  ),
};

const VIVIFY_6_REMS = {
  spell: SPELLS.VIVIFY,
  condition: cnd.describe(
    mwCnd.targetsHealed(
      { atLeast: 7 }, // 6 rems + 1 primary target
    ),
    (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} 6 active{' '}
        <SpellLink spell={talents.RENEWING_MIST_TALENT} />
      </>
    ),
  ),
};

const SOOM_BEFORE_VIVIFY = {
  spell: SPELLS.VIVIFY,
  condition: cnd.or(cnd.lastSpellCast(talents.SOOTHING_MIST_TALENT)),
};

const BLACKOUT_KICK = {
  spell: SPELLS.BLACKOUT_KICK,
  condition: cnd.optionalRule(
    cnd.describe(
      cnd.spellCooldownRemaining(talents.RISING_SUN_KICK_TALENT, { atLeast: 3500, atMost: 12000 }),
      (tense) => (
        <>
          <SpellLink spell={talents.RISING_SUN_KICK_TALENT} /> has more than half its cooldown
          remaining
        </>
      ),
    ),
  ),
};

const commonTop = [
  {
    spell: talents.RENEWING_MIST_TALENT,
    condition: cnd.describe(
      cnd.and(
        cnd.spellCharges(talents.RENEWING_MIST_TALENT, { atLeast: 2 }),
        cnd.spellAvailable(talents.RENEWING_MIST_TALENT),
        cnd.hasTalent(talents.RISING_MIST_TALENT),
      ),
      (tense) => <>you {tenseAlt(tense, 'have', 'had')} 2 charges</>,
    ),
  },
  {
    spell: talents.RISING_SUN_KICK_TALENT,
    condition: cnd.hasTalent(TALENTS_MONK.RISING_MIST_TALENT),
  },
  {
    spell: talents.RENEWING_MIST_TALENT,
    condition: cnd.optionalRule(cnd.spellAvailable(talents.RENEWING_MIST_TALENT)),
  },
];

const commonBottom = [talents.CHI_WAVE_TALENT];
const atMissingCondition = cnd.buffMissing(talents.ANCIENT_TEACHINGS_TALENT, {
  duration: 15000,
  timeRemaining: 1500,
});

const EF_AT = {
  spell: talents.ESSENCE_FONT_TALENT,
  condition: atMissingCondition,
};

const RM_AT_CORE = [VIVIFY_8_REMS, EF_AT, VIVIFY_6_REMS];

const rotation_rm_at_sg = build([
  {
    spell: talents.RENEWING_MIST_TALENT,
    condition: cnd.describe(cnd.lastSpellCast(talents.THUNDER_FOCUS_TEA_TALENT), (tense) => (
      <>
        {' '}
        you cast <SpellLink spell={talents.THUNDER_FOCUS_TEA_TALENT} />
      </>
    )),
  },
  ...commonTop,
  SHEILUNS_SHAOHAOS,
  ...RM_AT_CORE,
  BLACKOUT_KICK,
  talents.CHI_BURST_TALENT,
  {
    spell: SPELLS.TIGER_PALM,
    condition: cnd.optionalRule(
      cnd.buffStacks(SPELLS.TEACHINGS_OF_THE_MONASTERY, { atLeast: 0, atMost: 3 }),
    ),
  },
  ...commonBottom,
]);

const rotation_rm_at_upw = build([
  {
    spell: talents.ESSENCE_FONT_TALENT,
    condition: cnd.describe(cnd.lastSpellCast(talents.THUNDER_FOCUS_TEA_TALENT), (tense) => (
      <>
        {' '}
        you cast <SpellLink spell={talents.THUNDER_FOCUS_TEA_TALENT} />
      </>
    )),
  },
  ...commonTop,
  ...RM_AT_CORE,
  {
    spell: talents.FAELINE_STOMP_TALENT,
    condition: cnd.describe(
      cnd.and(
        cnd.hasTalent(talents.FAELINE_STOMP_TALENT),
        cnd.hasTalent(talents.UPWELLING_TALENT),
        cnd.spellCooldownRemaining(talents.ESSENCE_FONT_TALENT, { atLeast: 0.00001 }),
        atMissingCondition,
      ),
      (tense) => (
        <>
          <SpellLink spell={talents.ESSENCE_FONT_TALENT} /> {tenseAlt(tense, 'is', 'was')} on
          cooldown and <SpellLink spell={talents.ANCIENT_TEACHINGS_TALENT} /> is missing or about to
          expire.
        </>
      ),
    ),
  },
  BLACKOUT_KICK,
  talents.CHI_BURST_TALENT,
  SPELLS.TIGER_PALM,
  ...commonBottom,
]);

const rotation_rm_cf_shaohaos = build([
  {
    spell: talents.RENEWING_MIST_TALENT,
    condition: cnd.describe(cnd.lastSpellCast(talents.THUNDER_FOCUS_TEA_TALENT), (tense) => (
      <>
        {' '}
        you cast <SpellLink spell={talents.THUNDER_FOCUS_TEA_TALENT} />
      </>
    )),
  },
  ...commonTop,
  SOOM_BEFORE_VIVIFY,
  VIVIFY_6_REMS,
  BLACKOUT_KICK,
  {
    spell: SPELLS.TIGER_PALM,
    condition: cnd.optionalRule(
      cnd.buffStacks(SPELLS.TEACHINGS_OF_THE_MONASTERY, { atLeast: 0, atMost: 3 }),
    ),
  },
  ...commonBottom,
]);

const rotation_fallback = build([...commonTop, ...commonBottom]);

export enum MistweaverApl {
  RisingMistAncientTeachingsShaohaos,
  RisingMistAncientTeachingsUpwellFls,
  RisingMistCloudedFocusShaohaos,
  AwakenedFaeline,
  TearOfMorning,
  Fallback,
}

export const chooseApl = (info: PlayerInfo): MistweaverApl => {
  if (
    info.combatant.hasTalent(talents.ANCIENT_TEACHINGS_TALENT) &&
    info.combatant.hasTalent(talents.RISING_MIST_TALENT) &&
    info.combatant.hasTalent(talents.SHAOHAOS_LESSONS_TALENT) &&
    info.combatant.hasTalent(talents.INVOKERS_DELIGHT_TALENT)
  ) {
    return MistweaverApl.RisingMistAncientTeachingsShaohaos;
  } else if (
    info.combatant.hasTalent(talents.ANCIENT_TEACHINGS_TALENT) &&
    info.combatant.hasTalent(talents.RISING_MIST_TALENT) &&
    info.combatant.hasTalent(talents.UPWELLING_TALENT) &&
    info.combatant.hasTalent(talents.INVOKERS_DELIGHT_TALENT)
  ) {
    return MistweaverApl.RisingMistAncientTeachingsUpwellFls;
  } else if (
    info.combatant.hasTalent(talents.CLOUDED_FOCUS_TALENT) &&
    info.combatant.hasTalent(talents.RISING_MIST_TALENT) &&
    info.combatant.hasTalent(talents.INVOKERS_DELIGHT_TALENT) &&
    info.combatant.hasTalent(talents.SHAOHAOS_LESSONS_TALENT)
  ) {
    return MistweaverApl.RisingMistCloudedFocusShaohaos;
  } else if (
    info.combatant.hasTalent(talents.AWAKENED_FAELINE_TALENT) &&
    info.combatant.hasTalent(talents.ANCIENT_TEACHINGS_TALENT)
  ) {
    return MistweaverApl.AwakenedFaeline;
  } else if (info.combatant.hasTalent(TALENTS_MONK.TEAR_OF_MORNING_TALENT)) {
    return MistweaverApl.TearOfMorning;
  }
  return MistweaverApl.Fallback;
};

const apls: Record<MistweaverApl, Apl> = {
  [MistweaverApl.RisingMistAncientTeachingsShaohaos]: rotation_rm_at_sg,
  [MistweaverApl.RisingMistAncientTeachingsUpwellFls]: rotation_rm_at_upw,
  [MistweaverApl.RisingMistCloudedFocusShaohaos]: rotation_rm_cf_shaohaos,
  [MistweaverApl.AwakenedFaeline]: rotation_fallback,
  [MistweaverApl.TearOfMorning]: rotation_fallback,
  [MistweaverApl.Fallback]: rotation_fallback,
};

export const apl = (info: PlayerInfo): Apl => {
  return apls[chooseApl(info)];
};

export const check = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl(info));
  return check(events, info);
};

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);
  return undefined;
});
