import { useMemo } from 'react';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { suggestion } from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import aplCheck, { build, CheckResult, tenseAlt } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import {
  targetsHit,
  buffPresent,
  buffMissing,
  hasLegendary,
  hasConduit,
  optional,
  hasTalent,
} from 'parser/shared/metrics/apl/conditions';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import talents from 'common/TALENTS/monk';
import { Section, useEvents, useInfo } from 'interface/guide';

export const apl = build([
  SPELLS.BONEDUST_BREW_CAST,
  {
    spell: talents.KEG_SMASH_BREWMASTER_TALENT,
    condition: buffPresent(SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL),
  },
  {
    spell: talents.BREATH_OF_FIRE_BREWMASTER_TALENT,
    condition: hasLegendary(SPELLS.CHARRED_PASSIONS),
  },
  {
    spell: talents.KEG_SMASH_BREWMASTER_TALENT,
    condition: cnd.describe(
      cnd.and(
        hasTalent(talents.STORMSTOUTS_LAST_KEG_BREWMASTER_TALENT),
        cnd.spellFractionalCharges(talents.KEG_SMASH_BREWMASTER_TALENT, { atLeast: 1.5 }),
      ),
      (tense) => (
        <>
          you {tenseAlt(tense, 'have', 'had')} 2 charges or the 2nd charge{' '}
          {tenseAlt(tense, 'is', 'was')} about to come off cooldown.
        </>
      ),
    ),
  },
  {
    spell: talents.KEG_SMASH_BREWMASTER_TALENT,
    condition: cnd.describe(cnd.not(cnd.hasLegendary(SPELLS.STORMSTOUTS_LAST_KEG)), () => ''),
  },
  [SPELLS.BLACKOUT_KICK_BRM, talents.KEG_SMASH_BREWMASTER_TALENT],
  talents.BREATH_OF_FIRE_BREWMASTER_TALENT,
  {
    spell: talents.RUSHING_JADE_WIND_BREWMASTER_TALENT,
    condition: buffMissing(talents.RUSHING_JADE_WIND_BREWMASTER_TALENT, {
      timeRemaining: 2000,
      duration: 6000,
    }),
  },
  { spell: SPELLS.SPINNING_CRANE_KICK_BRM, condition: buffPresent(SPELLS.CHARRED_PASSIONS_BUFF) },
  talents.CHI_WAVE_TALENT,
  talents.CHI_BURST_TALENT,
  {
    spell: SPELLS.SPINNING_CRANE_KICK_BRM,
    condition: targetsHit(
      { atLeast: 2 },
      {
        lookahead: 500,
        targetType: EventType.Damage,
        targetSpell: SPELLS.SPINNING_CRANE_KICK_DAMAGE,
      },
    ),
  },
  {
    spell: SPELLS.SPINNING_CRANE_KICK_BRM,
    condition: optional(
      hasConduit(SPELLS.WALK_WITH_THE_OX),
      <>
        It is worthwhile to cast <SpellLink id={SPELLS.SPINNING_CRANE_KICK_BRM.id} /> over{' '}
        <SpellLink id={SPELLS.TIGER_PALM.id} /> when using this conduit <em>if</em> doing so would
        get you an extra cast of{' '}
        <SpellLink id={talents.INVOKE_NIUZAO_THE_BLACK_OX_BREWMASTER_TALENT.id} /> that lines up
        with incoming damage. We cannot check this automatically, and be warned that it is a small
        defensive loss due to the loss of Brew cooldown reduction.
      </>,
    ),
  },
  SPELLS.TIGER_PALM,
]);

export const check = aplCheck(apl);

export default suggestion((events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
});

export function AplSection(): JSX.Element | null {
  const events = useEvents();
  const info = useInfo();

  const { successes, violations } = useMemo(() => info ? check(events, info) : {} as Partial<CheckResult>, [events, info]);

  if (!info) {
    return null;
  }


  return (
    <Section title="Rotation">
      Brewmaster Monk uses a <em>priority list</em> for determining which of your offensive
      abilities to cast. <section>TODO BETTER TEXT</section>
    </Section>
  );
}
