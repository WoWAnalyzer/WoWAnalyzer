import SPELLS_COMMON from 'common/SPELLS';
import SPELLS from '../../spell-list_Monk_Brewmaster.retail';
import { suggestion } from 'parser/core/Analyzer';
import aplCheck, { Apl, build, CheckResult, PlayerInfo } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import talents from 'common/TALENTS/monk';
import { AnyEvent } from 'parser/core/Events';
import { SpellLink, TooltipElement } from 'interface';

const withCombo = cnd.buffPresent(SPELLS_COMMON.BLACKOUT_COMBO_BUFF);

const CHP_SETUP = {
  spell: talents.BREATH_OF_FIRE_TALENT,
  condition: cnd.optionalRule(
    cnd.and(
      cnd.hasTalent(talents.CHARRED_PASSIONS_TALENT),
      cnd.not(withCombo),
      cnd.buffMissing(SPELLS_COMMON.CHARRED_PASSIONS_BUFF, {
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
              <SpellLink spell={SPELLS_COMMON.BLACKOUT_KICK_BRM} /> can be a damage gain, but if you
              find yourself doing it too often it means you are missing{' '}
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
      <SpellLink spell={SPELLS_COMMON.BLACKOUT_KICK_BRM} />
    </>
  ),
};

const standardApl = build([
  CHP_SETUP,
  SPELLS.BLACKOUT_KICK,
  {
    spell: SPELLS.CHI_BURST_TALENT,
    condition: cnd.hasTalent(talents.MANIFESTATION_TALENT),
    description: (
      <>
        Cast <SpellLink spell={SPELLS.CHI_BURST_TALENT} /> (as{' '}
        <SpellLink spell={SPELLS.ASPECT_OF_HARMONY_TALENT}>MoH</SpellLink>)
      </>
    ),
  },
  {
    spell: SPELLS.TIGER_PALM,
    condition: withCombo,
  },
  {
    spell: SPELLS.KEG_SMASH_TALENT,
    condition: cnd.buffPresent(SPELLS_COMMON.EMPTY_BARREL_BUFF),
  },
  {
    spell: SPELLS.KEG_SMASH_TALENT,
    condition: cnd.and(
      cnd.spellFractionalCharges(SPELLS.KEG_SMASH_TALENT, { atLeast: 1.8 }),
      cnd.hasTalent(talents.FLURRY_STRIKES_TALENT),
    ),
    description: (
      <>
        Cast <SpellLink spell={SPELLS.KEG_SMASH_TALENT} /> at or near 2 charges (as{' '}
        <SpellLink spell={SPELLS.FLURRY_STRIKES_TALENT}>Shado-Pan</SpellLink>)
      </>
    ),
  },
  SPELLS.BREATH_OF_FIRE_TALENT,
  SPELLS.CHI_BURST_TALENT,
  SPELLS.KEG_SMASH_TALENT,
]);

export enum BrewmasterApl {
  Standard,
}

export const chooseApl = (_info: PlayerInfo): BrewmasterApl => {
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
