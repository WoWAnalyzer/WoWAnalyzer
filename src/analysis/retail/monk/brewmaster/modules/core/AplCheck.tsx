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

const standardApl = build([]);
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
