import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, tenseAlt } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import * as mwCnd from './conditions';
import talents, { TALENTS_MONK } from 'common/TALENTS/monk';
import { AnyEvent, EventType } from 'parser/core/Events';
import { SpellLink } from 'interface';

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
  condition: cnd.buffPresent(SPELLS.STRENGTH_OF_THE_BLACK_OX_BUFF),
};

const SPIRITFONT_PROC = {
  spell: talents.ENVELOPING_MIST_TALENT,
  condition: cnd.buffStacks(SPELLS.SPIRITFONT_BUFF, { atLeast: 2, atMost: 2 }),
};

const MANA_TEA_20_STACKS = {
  spell: SPELLS.MANA_TEA_CAST,
  condition: cnd.and(
    cnd.buffStacks(SPELLS.MANA_TEA_STACK, { atLeast: 20, atMost: 20 }),
    mwCnd.manaPercent({ atMost: 99 }),
  ),
};

const MANA_TEA_ANY_STACKS = {
  spell: SPELLS.MANA_TEA_CAST,
  condition: cnd.optionalRule(
    cnd.and(
      cnd.buffStacks(SPELLS.MANA_TEA_STACK, { atLeast: 1 }),
      mwCnd.manaPercent({ atMost: 99 }),
    ),
  ),
};

const REM_AFTER_THUNDER_FOCUS_TEA = {
  spell: SPELLS.RENEWING_MIST_CAST,
  condition: cnd.describe(cnd.lastSpellCast(talents.THUNDER_FOCUS_TEA_TALENT), (tense) => (
    <>
      {' '}
      you cast <SpellLink spell={talents.THUNDER_FOCUS_TEA_TALENT} />
    </>
  )),
};

const SPIRITFONT_OVERCAP = {
  spell: talents.ENVELOPING_MIST_TALENT,
  condition: cnd.optionalRule(
    cnd.buffStacks(SPELLS.SPIRITFONT_BUFF, { atLeast: 2, atMost: 2 }),
    <>
      <div>
        <b>This does not mean you should only spend at 2 stacks.</b>{' '}
      </div>
      <div>
        <SpellLink spell={talents.THUNDER_FOCUS_TEA_TALENT} /> grants you a{' '}
        <SpellLink spell={SPELLS.SPIRITFONT_BUFF} /> stack on cast, so if you're already sitting at
        2, spend at least one beforehand to avoid overcapping. Continue to use this regularly (later
        in the priority list) with damage on your group.
      </div>
    </>,
    'to avoid overcapping',
  ),
};

// "injured" is harder to quantify here, but we
// model this elsewhere on the analyzer
const VIVIFY_INJURED_RAID = {
  spell: SPELLS.VIVIFY,
  condition: cnd.optionalRule(
    cnd.describe(
      mwCnd.targetsHealed(
        { atLeast: 8 },
        {
          lookahead: 750,
          targetSpell: SPELLS.INVIGORATING_MISTS_HEAL,
          targetType: EventType.Heal,
        },
      ),
      (tense) => (
        <>
          you {tenseAlt(tense, 'have', 'had')} at least 8 active{' '}
          <SpellLink spell={SPELLS.RENEWING_MIST_CAST} />s
        </>
      ),
    ),
    undefined,
    'with an injured raid',
  ),
};

// this will always be true, since spiritfont
// has a "won't activate unless injured" component
const SPIRITFONT_PROC_INJURED_RAID = {
  spell: talents.ENVELOPING_MIST_TALENT,
  condition: cnd.optionalRule(
    cnd.buffStacks(SPELLS.SPIRITFONT_BUFF, { atLeast: 1, atMost: 1 }),
    undefined,
    'with an injured raid',
  ),
};

const BLACKOUT_KICK_FILLER = {
  spell: SPELLS.BLACKOUT_KICK,
  condition: cnd.optionalRule(cnd.spellAvailable(SPELLS.BLACKOUT_KICK)),
};

const TOTM_NOT_CAPPED = cnd.buffStacks(SPELLS.TEACHINGS_OF_THE_MONASTERY, {
  atLeast: 0,
  atMost: 3,
});

const TIGER_PALM_FILLER = {
  spell: SPELLS.TIGER_PALM,
  condition: cnd.optionalRule(
    cnd.and(cnd.spellAvailable(SPELLS.BLACKOUT_KICK, { inverse: true }), TOTM_NOT_CAPPED),
  ),
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
  SPIRITFONT_PROC,
  BLACK_OX_PROC,
  MANA_TEA_20_STACKS,
];

const RM_JFT_CORE = [ZP_VIVIFY_5_REMS, VIVIFY_8_REMS];

const rotation_rm_jft = build([
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
  ...RM_JFT_CORE,
  BLACKOUT_KICK,
  REM_REMAINING,
  {
    spell: SPELLS.TIGER_PALM,
    condition: cnd.optionalRule(TOTM_NOT_CAPPED),
  },
]);

const rotation_rm_rwk = build([
  talents.RUSHING_WIND_KICK_MISTWEAVER_TALENT,
  {
    spell: SPELLS.RENEWING_MIST_CAST,
    condition: cnd.spellCharges(SPELLS.RENEWING_MIST_CAST, { atLeast: 3 }),
  },
  MANA_TEA_20_STACKS,
  SPIRITFONT_OVERCAP,
  REM_AFTER_THUNDER_FOCUS_TEA,
  REM_REMAINING,
  VIVIFY_INJURED_RAID,
  SPIRITFONT_PROC_INJURED_RAID,
  BLACK_OX_PROC,
  MANA_TEA_ANY_STACKS,
  BLACKOUT_KICK_FILLER,
  TIGER_PALM_FILLER,
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
  [MistweaverApl.RisingMistJadefireTeachings]: rotation_rm_jft,
  [MistweaverApl.RisingMistRushingWindKick]: rotation_rm_rwk,
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
