import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, tenseAlt } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import * as mwCnd from './conditions';
import talents, { TALENTS_MONK } from 'common/TALENTS/monk';
import { AnyEvent, EventType } from 'parser/core/Events';
import { SpellLink } from 'interface';

const AOE_SCK = {
  spell: SPELLS.SPINNING_CRANE_KICK,
  condition: cnd.and(
    cnd.targetsHit(
      { atLeast: 4 },
      {
        targetSpell: SPELLS.SPINNING_CRANE_KICK_DAMAGE,
      },
    ),
    cnd.hasTalent(talents.WAY_OF_THE_CRANE_TALENT),
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
      { atLeast: 8 }, // 8 rems + 1 primary target
      { lookahead: 750, targetSpell: SPELLS.INVIGORATING_MISTS_HEAL, targetType: EventType.Heal },
    ),
    (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} 8 active{' '}
        <SpellLink spell={SPELLS.RENEWING_MIST_CAST} />
      </>
    ),
  ),
};

const ZP_VIVIFY_5_REMS = {
  spell: SPELLS.VIVIFY,
  condition: cnd.describe(
    cnd.and(
      mwCnd.targetsHealed(
        { atLeast: 5 }, // 6 rems + 1 primary target
        { lookahead: 750, targetSpell: SPELLS.INVIGORATING_MISTS_HEAL, targetType: EventType.Heal },
      ),
      cnd.buffStacks(SPELLS.ZEN_PULSE_BUFF, { atLeast: 2, atMost: 2 }),
    ),
    (tense) => (
      <>
        you {tenseAlt(tense, 'have', 'had')} 2 <SpellLink spell={talents.ZEN_PULSE_TALENT} /> buffs
        and at least 5 active <SpellLink spell={SPELLS.RENEWING_MIST_CAST} />
        s.
      </>
    ),
  ),
};
const BLACKOUT_KICK = {
  spell: SPELLS.BLACKOUT_KICK,
  condition: cnd.optionalRule(
    cnd.describe(
      cnd.or(
        cnd.spellCooldownRemaining(talents.RISING_SUN_KICK_TALENT, {
          atLeast: 3500,
          atMost: 12000,
        }),
        cnd.spellCooldownRemaining(talents.RUSHING_WIND_KICK_MISTWEAVER_TALENT, {
          atLeast: 3500,
          atMost: 12000,
        }),
      ),
      (tense) => (
        <>
          <SpellLink spell={talents.RISING_SUN_KICK_TALENT} /> has more than half its cooldown
          remaining
        </>
      ),
    ),
  ),
};

const REM_REMAINING = {
  spell: SPELLS.RENEWING_MIST_CAST,
  condition: cnd.optionalRule(cnd.spellAvailable(SPELLS.RENEWING_MIST_CAST)),
};

const BLACK_OX_PROC = {
  spell: talents.ENVELOPING_MIST_TALENT,
  condition: cnd.and(
    cnd.buffPresent(SPELLS.STRENGTH_OF_THE_BLACK_OX_BUFF),
    cnd.hasTalent(talents.STRENGTH_OF_THE_BLACK_OX_TALENT),
  ),
};

const MANA_TEA_20_STACKS = {
  spell: SPELLS.MANA_TEA_CAST,
  condition: cnd.buffStacks(SPELLS.MANA_TEA_STACK, { atLeast: 20, atMost: 20 }),
};

const commonTop = [
  {
    spell: SPELLS.RENEWING_MIST_CAST,
    condition: cnd.describe(
      cnd.and(
        cnd.spellCharges(SPELLS.RENEWING_MIST_CAST, { atLeast: 2 }),
        cnd.spellAvailable(SPELLS.RENEWING_MIST_CAST),
        cnd.hasTalent(talents.RISING_MIST_TALENT),
        cnd.not(cnd.hasTalent(talents.POOL_OF_MISTS_TALENT)),
      ),
      (tense) => <>you {tenseAlt(tense, 'have', 'had')} 2 charges</>,
    ),
  },
  {
    spell: SPELLS.RENEWING_MIST_CAST,
    condition: cnd.describe(
      cnd.and(
        cnd.spellCharges(SPELLS.RENEWING_MIST_CAST, { atLeast: 3 }),
        cnd.spellAvailable(SPELLS.RENEWING_MIST_CAST),
        cnd.hasTalent(talents.RISING_MIST_TALENT),
        cnd.hasTalent(talents.POOL_OF_MISTS_TALENT),
      ),
      (tense) => <>you {tenseAlt(tense, 'have', 'had')} 3 charges</>,
    ),
  },
  {
    spell: talents.RISING_SUN_KICK_TALENT,
    condition: cnd.and(
      cnd.hasTalent(TALENTS_MONK.RISING_MIST_TALENT),
      cnd.not(cnd.hasTalent(TALENTS_MONK.RUSHING_WIND_KICK_MISTWEAVER_TALENT)),
    ),
  },
  {
    spell: talents.RUSHING_WIND_KICK_MISTWEAVER_TALENT,
    condition: cnd.and(
      cnd.hasTalent(TALENTS_MONK.RISING_MIST_TALENT),
      cnd.hasTalent(TALENTS_MONK.RUSHING_WIND_KICK_MISTWEAVER_TALENT),
    ),
  },
  BLACK_OX_PROC,
  MANA_TEA_20_STACKS,
];

const atMissingCondition = cnd.buffMissing(SPELLS.JT_BUFF, {
  duration: 15000,
  timeRemaining: 1500,
});

const JFS_AT = {
  spell: talents.JADEFIRE_STOMP_TALENT,
  condition: atMissingCondition,
};

const JE_JFS = {
  spell: SPELLS.CRACKLING_JADE_LIGHTNING,
  condition: cnd.optionalRule(
    cnd.and(cnd.buffPresent(SPELLS.JT_BUFF), cnd.buffPresent(SPELLS.JADE_EMPOWERMENT_BUFF)),
  ),
};

const RM_AT_CORE = [JE_JFS, ZP_VIVIFY_5_REMS, JFS_AT, VIVIFY_8_REMS];

const rotation_rm_at_sg = build([
  {
    spell: [SPELLS.RENEWING_MIST_CAST, talents.RISING_SUN_KICK_TALENT],
    condition: cnd.describe(cnd.lastSpellCast(talents.THUNDER_FOCUS_TEA_TALENT), (tense) => (
      <>
        {' '}
        you cast <SpellLink spell={talents.THUNDER_FOCUS_TEA_TALENT} />
      </>
    )),
  },
  ...commonTop,
  ...RM_AT_CORE,
  BLACKOUT_KICK,
  REM_REMAINING,
  {
    spell: SPELLS.TIGER_PALM,
    condition: cnd.optionalRule(
      cnd.buffStacks(SPELLS.TEACHINGS_OF_THE_MONASTERY, { atLeast: 0, atMost: 3 }),
    ),
  },
]);

const rotation_rm_rwk_sg = build([
  {
    spell: SPELLS.RENEWING_MIST_CAST,
    condition: cnd.describe(cnd.lastSpellCast(talents.THUNDER_FOCUS_TEA_TALENT), (tense) => (
      <>
        {' '}
        you cast <SpellLink spell={talents.THUNDER_FOCUS_TEA_TALENT} />
      </>
    )),
  },
  ...commonTop,
  ZP_VIVIFY_5_REMS,
  SHEILUNS_SHAOHAOS,
  VIVIFY_8_REMS,
  REM_REMAINING,
  BLACKOUT_KICK,
  {
    spell: SPELLS.TIGER_PALM,
    condition: cnd.optionalRule(
      cnd.buffStacks(SPELLS.TEACHINGS_OF_THE_MONASTERY, { atLeast: 0, atMost: 3 }),
    ),
  },
]);

const rotation_fallback = build([...commonTop]);

export enum MistweaverApl {
  RisingMistJadefireTeachings,
  RisingMistRushingWindKick,
  WayOfTheCrane,
  TearOfMorning,
  Fallback,
}

export const chooseApl = (info: PlayerInfo): MistweaverApl => {
  if (info.combatant.hasTalent(talents.RISING_MIST_TALENT)) {
    if (info.combatant.hasTalent(talents.JADEFIRE_TEACHINGS_TALENT)) {
      return MistweaverApl.RisingMistJadefireTeachings;
    }
    if (info.combatant.hasTalent(talents.RUSHING_WIND_KICK_MISTWEAVER_TALENT)) {
      return MistweaverApl.RisingMistRushingWindKick;
    }
  } else if (
    info.combatant.hasTalent(talents.WAY_OF_THE_CRANE_TALENT) &&
    info.combatant.hasTalent(talents.JADEFIRE_TEACHINGS_TALENT)
  ) {
    return MistweaverApl.WayOfTheCrane;
  } else if (info.combatant.hasTalent(TALENTS_MONK.TEAR_OF_MORNING_TALENT)) {
    return MistweaverApl.TearOfMorning;
  }
  return MistweaverApl.Fallback;
};

const apls: Record<MistweaverApl, Apl> = {
  [MistweaverApl.RisingMistJadefireTeachings]: rotation_rm_at_sg,
  [MistweaverApl.RisingMistRushingWindKick]: rotation_rm_rwk_sg,
  [MistweaverApl.WayOfTheCrane]: rotation_fallback,
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
