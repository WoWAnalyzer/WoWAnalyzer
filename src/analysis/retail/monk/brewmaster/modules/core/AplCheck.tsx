import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, tenseAlt } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import talents from 'common/TALENTS/monk';
import { AnyEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';

const withCombo = cnd.buffPresent(SPELLS.BLACKOUT_COMBO_BUFF);

const SCK_AOE = {
  spell: SPELLS.SPINNING_CRANE_KICK_BRM,
  condition: cnd.targetsHit(
    { atLeast: 2 },
    {
      targetSpell: SPELLS.SPINNING_CRANE_KICK_DAMAGE,
    },
  ),
};

const standardApl = build([
  SPELLS.BLACKOUT_KICK_BRM,
  {
    spell: [
      talents.RISING_SUN_KICK_TALENT,
      talents.CHI_BURST_SHARED_TALENT,
      talents.RUSHING_JADE_WIND_BREWMASTER_TALENT,
    ],
    condition: cnd.optionalRule(
      cnd.and(withCombo, cnd.spellCooldownRemaining(SPELLS.BLACKOUT_KICK_BRM, { atLeast: 1000 })),
    ),
    description: (
      <>
        (Optional) You can cast non-<SpellLink spell={SPELLS.BLACKOUT_COMBO_BUFF}>Combo</SpellLink>{' '}
        abilities like <SpellLink spell={talents.RISING_SUN_KICK_TALENT} /> before spending{' '}
        <SpellLink spell={SPELLS.BLACKOUT_COMBO_BUFF} /> if it won't delay{' '}
        <SpellLink spell={SPELLS.BLACKOUT_KICK_BRM} />
      </>
    ),
  },
  {
    spell: SPELLS.TIGER_PALM,
    condition: withCombo,
  },
  talents.KEG_SMASH_TALENT,
  {
    spell: talents.BREATH_OF_FIRE_TALENT,
    condition: cnd.describe(
      cnd.and(
        cnd.not(withCombo),
        cnd.hasTalent(talents.CHARRED_PASSIONS_TALENT),
        cnd.hasTalent(talents.SALSALABIMS_STRENGTH_TALENT),
        cnd.buffMissing(SPELLS.CHARRED_PASSIONS_BUFF, {
          duration: 8000,
          timeRemaining: 2000,
          pandemicCap: 1,
        }),
      ),
      (tense) => (
        <>
          you {tenseAlt(tense, 'are', 'were')} missing the{' '}
          <SpellLink spell={SPELLS.CHARRED_PASSIONS_BUFF} /> buff
        </>
      ),
    ),
  },
  talents.RISING_SUN_KICK_TALENT,
  talents.CHI_BURST_SHARED_TALENT,
  talents.BREATH_OF_FIRE_TALENT,
  talents.RUSHING_JADE_WIND_BREWMASTER_TALENT,
  SCK_AOE,
  SPELLS.TIGER_PALM,
]);

export enum BrewmasterApl {
  Standard,
}

export const chooseApl = (info: PlayerInfo): BrewmasterApl => {
  return BrewmasterApl.Standard;
};

const apls: Record<BrewmasterApl, Apl> = {
  [BrewmasterApl.Standard]: standardApl,
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
