import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, Rule } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import talents from 'common/TALENTS/monk';
import { AnyEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';
import { SCK_DAMAGE_LINK } from '../../normalizers/SpinningCraneKick';
import Spell from 'common/SPELLS/Spell';

const SCK_AOE = {
  spell: SPELLS.SPINNING_CRANE_KICK_BRM,
  condition: cnd.targetsHit(
    { atLeast: 2 },
    {
      targetSpell: SPELLS.SPINNING_CRANE_KICK_DAMAGE,
    },
  ),
};

const SCK_CHP_WWTO = {
  spell: SPELLS.SPINNING_CRANE_KICK_BRM,
  condition: cnd.and(
    cnd.hasTalent(talents.WALK_WITH_THE_OX_TALENT),
    cnd.buffPresent(SPELLS.CHARRED_PASSIONS_BUFF),
  ),
};

const boc = (spell: Spell): Rule => ({
  spell,
  condition: cnd.buffPresent(SPELLS.BLACKOUT_COMBO_BUFF),
});

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
  SCK_CHP_WWTO,
  SPELLS.TIGER_PALM,
  talents.CHI_WAVE_TALENT,
  talents.CHI_BURST_TALENT,
];

const commonHighPrio = [EK_SCK];

const rotation_boc_dfb = build([
  ...commonHighPrio,
  SPELLS.BLACKOUT_KICK_BRM,
  talents.RISING_SUN_KICK_TALENT,
  applyRjw,
  boc(talents.BREATH_OF_FIRE_TALENT),
  talents.KEG_SMASH_TALENT,
  ...commonLowPrio,
]);

const rotation_dfb = build([
  ...commonHighPrio,
  SPELLS.BLACKOUT_KICK_BRM,
  talents.RISING_SUN_KICK_TALENT,
  applyRjw,
  talents.BREATH_OF_FIRE_TALENT,
  talents.KEG_SMASH_TALENT,
  ...commonLowPrio,
]);

const rotation_chp = build([
  ...commonHighPrio,
  refreshChp,
  SPELLS.BLACKOUT_KICK_BRM,
  talents.RISING_SUN_KICK_TALENT,
  applyRjw,
  talents.KEG_SMASH_TALENT,
  ...commonLowPrio,
]);

const rotation_fallback = build([
  ...commonHighPrio,
  SPELLS.BLACKOUT_KICK_BRM,
  talents.RISING_SUN_KICK_TALENT,
  talents.KEG_SMASH_TALENT,
  talents.BREATH_OF_FIRE_TALENT,
  ...commonLowPrio,
]);

export enum BrewmasterApl {
  BoC_DfB,
  DfB,
  ChP,
  Fallback,
}

export const chooseApl = (info: PlayerInfo): BrewmasterApl => {
  if (
    info.combatant.hasTalent(talents.BLACKOUT_COMBO_TALENT) &&
    info.combatant.hasTalent(talents.DRAGONFIRE_BREW_TALENT)
  ) {
    return BrewmasterApl.BoC_DfB;
  } else if (info.combatant.hasTalent(talents.DRAGONFIRE_BREW_TALENT)) {
    return BrewmasterApl.DfB;
  } else if (info.combatant.hasTalent(talents.CHARRED_PASSIONS_TALENT)) {
    return BrewmasterApl.ChP;
  } else {
    return BrewmasterApl.Fallback;
  }
};

const apls: Record<BrewmasterApl, Apl> = {
  [BrewmasterApl.BoC_DfB]: rotation_boc_dfb,
  [BrewmasterApl.DfB]: rotation_dfb,
  [BrewmasterApl.ChP]: rotation_chp,
  [BrewmasterApl.Fallback]: rotation_fallback,
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
