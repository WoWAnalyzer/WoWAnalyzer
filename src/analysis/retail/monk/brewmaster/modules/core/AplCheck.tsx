import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, {
  Apl,
  build,
  CheckResult,
  Condition,
  PlayerInfo,
  Rule,
  tenseAlt,
} from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import talents from 'common/TALENTS/monk';
import { AnyEvent, GetRelatedEvents } from 'parser/core/Events';
import { SpellLink } from 'interface';
import { SCK_DAMAGE_LINK } from '../../normalizers/SpinningCraneKick';
import { KS_DAMAGE, PTA_TRIGGER_BUFF } from '../talents/PressTheAdvantage/normalizer';

const SCK_AOE = {
  spell: SPELLS.SPINNING_CRANE_KICK_BRM,
  condition: cnd.targetsHit(
    { atLeast: 2 },
    {
      targetSpell: SPELLS.SPINNING_CRANE_KICK_DAMAGE,
    },
  ),
};

const refreshRjw = {
  spell: talents.RUSHING_JADE_WIND_TALENT,
  condition: cnd.buffMissing(talents.RUSHING_JADE_WIND_TALENT, {
    timeRemaining: 1500,
    duration: 6000,
    pandemicCap: 1.5,
  }),
};

const applyRjw = {
  spell: talents.RUSHING_JADE_WIND_TALENT,
  condition: cnd.buffMissing(talents.RUSHING_JADE_WIND_TALENT),
};

const refreshChp: Rule = {
  spell: talents.BREATH_OF_FIRE_TALENT,
  condition: cnd.buffMissing(SPELLS.CHARRED_PASSIONS_BUFF, {
    timeRemaining: 2000,
    duration: 8000,
    pandemicCap: 1,
  }),
};

const EK_SCK: Rule = {
  spell: SPELLS.SPINNING_CRANE_KICK_BRM,
  condition: cnd.optionalRule(
    cnd.debuffPresent(talents.EXPLODING_KEG_TALENT, {
      targetLinkRelation: SCK_DAMAGE_LINK,
    }),
    <>
      Use <SpellLink spell={SPELLS.SPINNING_CRANE_KICK_BRM} /> to trigger the bonus damage from{' '}
      <SpellLink spell={talents.EXPLODING_KEG_TALENT} /> while the debuff is active.
    </>,
    false,
  ),
};

const commonLowPrio = [
  refreshRjw,
  SCK_AOE,
  SPELLS.TIGER_PALM,
  talents.CHI_WAVE_TALENT,
  talents.CHI_BURST_TALENT,
];

const commonHighPrio = [EK_SCK];

const chpSequenceCnd = cnd.describe(
  cnd.and(
    cnd.hasTalent(talents.CHARRED_PASSIONS_TALENT),
    cnd.buffMissing(SPELLS.CHARRED_PASSIONS_BUFF, {
      pandemicCap: 1,
      duration: 8000,
      timeRemaining: 4000,
    }),
  ),
  () => (
    <>
      performing the{' '}
      <strong>
        Maintain <SpellLink spell={talents.CHARRED_PASSIONS_TALENT} />
      </strong>{' '}
      block
    </>
  ),
);

const chp_sequence = [
  {
    spell: SPELLS.TIGER_PALM,
    condition: cnd.and(chpSequenceCnd, cnd.buffPresent(SPELLS.BLACKOUT_COMBO_BUFF)),
  },
  {
    spell: talents.BREATH_OF_FIRE_TALENT,
    condition: chpSequenceCnd,
  },
  {
    spell: talents.KEG_SMASH_TALENT,
    condition: chpSequenceCnd,
  },
];

const dump_cd_sequence: Rule[] = [
  {
    spell: SPELLS.TIGER_PALM,
    condition: cnd.describe(
      cnd.or(
        cnd.optionalRule(cnd.buffPresent(SPELLS.BLACKOUT_COMBO_BUFF)),
        cnd.and(
          cnd.buffPresent(SPELLS.BLACKOUT_COMBO_BUFF),
          cnd.spellCooldownRemaining(SPELLS.BLACKOUT_KICK_BRM, { atMost: 2000 }),
        ),
      ),
      (tense) => (
        <>
          performing the <strong>Spend Cooldowns</strong> block and{' '}
          <SpellLink spell={SPELLS.BLACKOUT_COMBO_BUFF} /> {tenseAlt(tense, 'is', 'was')} present
        </>
      ),
    ),
  },
  // this is fairly lax. could prioritize it a bit but not going to for now.
  {
    spell: [
      talents.BONEDUST_BREW_TALENT,
      talents.EXPLODING_KEG_TALENT,
      talents.WEAPONS_OF_ORDER_TALENT,
      talents.SUMMON_WHITE_TIGER_STATUE_TALENT,
      talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT,
      talents.RISING_SUN_KICK_TALENT,
      talents.RUSHING_JADE_WIND_TALENT,
      talents.CHI_WAVE_TALENT,
      talents.CHI_BURST_TALENT,
    ],
    description: (
      <>
        Spend cooldowns like <SpellLink spell={talents.RISING_SUN_KICK_TALENT} />,{' '}
        <SpellLink spell={talents.RUSHING_JADE_WIND_TALENT} />,{' '}
        <SpellLink spell={talents.BONEDUST_BREW_TALENT} />, or{' '}
        <SpellLink spell={talents.WEAPONS_OF_ORDER_TALENT} />
      </>
    ),
  },
];

const rotation_boc_tp = build([
  {
    spell: talents.BREATH_OF_FIRE_TALENT,
    condition: cnd.describe(
      cnd.and(
        cnd.hasTalent(talents.CHARRED_PASSIONS_TALENT),
        cnd.buffMissing(SPELLS.CHARRED_PASSIONS_BUFF, {
          pandemicCap: 1,
          duration: 8000,
          timeRemaining: 0,
        }),
        cnd.spellCooldownRemaining(SPELLS.BLACKOUT_KICK_BRM, { atMost: 2000 }),
      ),
      (tense) => (
        <>
          <SpellLink spell={talents.CHARRED_PASSIONS_TALENT} /> {tenseAlt(tense, 'is', 'was')}{' '}
          missing before casting <SpellLink spell={SPELLS.BLACKOUT_KICK_BRM} />.
        </>
      ),
    ),
  },
  SPELLS.BLACKOUT_KICK_BRM,
  ...chp_sequence,
  ...dump_cd_sequence,
]);

const spendPtaCondition: Condition<null> = {
  key: 'pta-trigger',
  init: () => null,
  update: () => null,
  describe: (tense) => (
    <>
      you {tenseAlt(tense, <>have</>, <>had</>)} 10 stacks of{' '}
      <SpellLink spell={talents.PRESS_THE_ADVANTAGE_TALENT} />
    </>
  ),
  validate: (_state, event, _spell) => {
    return GetRelatedEvents(event, PTA_TRIGGER_BUFF).length > 0;
  },
};

const rotation_other = build([
  ...commonHighPrio,
  {
    spell: talents.KEG_SMASH_TALENT,
    condition: cnd.describe(
      cnd.and(spendPtaCondition, cnd.targetsHit({ atLeast: 2 }, { targetLinkRelation: KS_DAMAGE })),
      (tense) => (
        <>
          you {tenseAlt(tense, <>have</>, <>had</>)} 10 stacks of{' '}
          <SpellLink spell={talents.PRESS_THE_ADVANTAGE_TALENT} /> and{' '}
          {tenseAlt(tense, 'hit', 'would hit')} multiple targets
        </>
      ),
    ),
  },
  {
    spell: talents.RISING_SUN_KICK_TALENT,
    condition: spendPtaCondition,
  },
  refreshChp,
  SPELLS.BLACKOUT_KICK_BRM,
  talents.RISING_SUN_KICK_TALENT,
  applyRjw,
  {
    spell: talents.BREATH_OF_FIRE_TALENT,
    condition: cnd.hasTalent(talents.DRAGONFIRE_BREW_TALENT),
  },
  talents.KEG_SMASH_TALENT,
  talents.BREATH_OF_FIRE_TALENT,
  ...commonLowPrio,
]);

export enum BrewmasterApl {
  BoC_TP,
  PTA,
  Fallback,
}

export const chooseApl = (info: PlayerInfo): BrewmasterApl => {
  if (
    info.combatant.hasTalent(talents.BLACKOUT_COMBO_TALENT) &&
    info.combatant.hasTalent(talents.CHARRED_PASSIONS_TALENT) &&
    !info.combatant.hasTalent(talents.PRESS_THE_ADVANTAGE_TALENT)
  ) {
    return BrewmasterApl.BoC_TP;
  } else if (info.combatant.hasTalent(talents.PRESS_THE_ADVANTAGE_TALENT)) {
    return BrewmasterApl.PTA;
  } else {
    return BrewmasterApl.Fallback;
  }
};

const apls: Record<BrewmasterApl, Apl> = {
  [BrewmasterApl.BoC_TP]: rotation_boc_tp,
  [BrewmasterApl.PTA]: rotation_other,
  [BrewmasterApl.Fallback]: rotation_other,
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
