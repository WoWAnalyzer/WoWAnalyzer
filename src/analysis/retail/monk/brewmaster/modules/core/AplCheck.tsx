import SPELLS from 'common/SPELLS';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { Apl, build, CheckResult, PlayerInfo, tenseAlt } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import talents from 'common/TALENTS/monk';
import { AnyEvent } from 'parser/core/Events';
import { SpellLink, TooltipElement } from 'interface';

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

const WOO_BUILDER = {
  spell: [talents.KEG_SMASH_TALENT, talents.RISING_SUN_KICK_TALENT],
  condition: cnd.optionalRule(
    cnd.and(
      cnd.buffPresent(talents.WEAPONS_OF_ORDER_TALENT),
      cnd.or(
        cnd.debuffStacks(SPELLS.WEAPONS_OF_ORDER_DEBUFF, { atMost: 3 }),
        cnd.debuffMissing(SPELLS.WEAPONS_OF_ORDER_DEBUFF, {
          duration: 10000,
          pandemicCap: 1,
          timeRemaining: 3000,
        }),
      ),
    ),
  ),
  description: (
    <>
      <TooltipElement content="Aggressively building stacks of WoO is not meaningfuly different from letting it build during your normal rotation in most cases, but it is a common play pattern and does similar total damage.">
        (Optional)
      </TooltipElement>{' '}
      Build up stacks of the <SpellLink spell={talents.WEAPONS_OF_ORDER_TALENT} /> debuff with{' '}
      <SpellLink spell={talents.KEG_SMASH_TALENT} /> or{' '}
      <SpellLink spell={talents.RISING_SUN_KICK_TALENT} />
    </>
  ),
};

const CHP_SETUP = {
  spell: talents.BREATH_OF_FIRE_TALENT,
  condition: cnd.optionalRule(
    cnd.and(
      cnd.hasTalent(talents.CHARRED_PASSIONS_TALENT),
      cnd.not(withCombo),
      cnd.buffMissing(SPELLS.CHARRED_PASSIONS_BUFF, {
        duration: 8000,
        timeRemaining: 2000,
        pandemicCap: 1,
      }),
    ),
  ),
  description: (
    <>
      <TooltipElement
        content={
          <>
            <p>
              Applying <SpellLink spell={talents.CHARRED_PASSIONS_TALENT} /> before using{' '}
              <SpellLink spell={SPELLS.BLACKOUT_KICK_BRM} /> can be a damage gain, but if you find
              yourself doing it too often it means you are missing{' '}
              <SpellLink spell={talents.BREATH_OF_FIRE_TALENT} /> casts during your normal rotation.
            </p>
            <p>
              You might run into this condition naturally when dealing with forced downtime, such as
              tank mechanics that require you to run away.
            </p>
          </>
        }
      >
        (Optional)
      </TooltipElement>{' '}
      Apply <SpellLink spell={talents.CHARRED_PASSIONS_TALENT} /> when it is missing before using{' '}
      <SpellLink spell={SPELLS.BLACKOUT_KICK_BRM} />
    </>
  ),
};

const standardApl = build([
  WOO_BUILDER,
  CHP_SETUP,
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
  {
    spell: talents.KEG_SMASH_TALENT,
    condition: cnd.describe(
      cnd.and(
        cnd.hasTalent(talents.STORMSTOUTS_LAST_KEG_TALENT),
        cnd.spellFractionalCharges(talents.KEG_SMASH_TALENT, { atLeast: 1.7 }),
      ),
      (tense) => <>when it {tenseAlt(tense, 'is', 'was')} near 2 charges</>,
    ),
  },
  {
    spell: talents.KEG_SMASH_TALENT,
    condition: cnd.not(cnd.hasTalent(talents.STORMSTOUTS_LAST_KEG_TALENT)),
  },
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
  talents.KEG_SMASH_TALENT,
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
