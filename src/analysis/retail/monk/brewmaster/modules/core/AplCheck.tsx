import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { suggestion } from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import aplCheck, { build, tenseAlt } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import {
  targetsHit,
  buffPresent,
  buffMissing,
  hasConduit,
  optional,
  hasTalent,
} from 'parser/shared/metrics/apl/conditions';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import talents from 'common/TALENTS/monk';

export const apl = build([
  SPELLS.BONEDUST_BREW_CAST,
  {
    spell: talents.KEG_SMASH_TALENT,
    condition: buffPresent(talents.WEAPONS_OF_ORDER_TALENT),
  },
  {
    spell: talents.KEG_SMASH_TALENT,
    condition: cnd.targetsHit({ atLeast: 2 }),
  },
  talents.RISING_SUN_KICK_TALENT,
  {
    spell: talents.BREATH_OF_FIRE_TALENT,
    condition: hasTalent(talents.CHARRED_PASSIONS_TALENT),
  },
  {
    spell: talents.KEG_SMASH_TALENT,
    condition: cnd.describe(
      cnd.and(
        hasTalent(talents.STORMSTOUTS_LAST_KEG_TALENT),
        cnd.spellFractionalCharges(talents.KEG_SMASH_TALENT, { atLeast: 1.5 }),
      ),
      (tense) => (
        <>
          you {tenseAlt(tense, 'have', 'had')} 2 charges or the 2nd charge{' '}
          {tenseAlt(tense, 'is', 'was')} about to come off cooldown.
        </>
      ),
    ),
  },
  [SPELLS.BLACKOUT_KICK_BRM, talents.KEG_SMASH_TALENT],
  talents.BREATH_OF_FIRE_TALENT,
  {
    spell: talents.RUSHING_JADE_WIND_TALENT,
    condition: buffMissing(talents.RUSHING_JADE_WIND_TALENT, {
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
        get you an extra cast of <SpellLink id={talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT.id} />{' '}
        that lines up with incoming damage. We cannot check this automatically, and be warned that
        it is a small defensive loss due to the loss of Brew cooldown reduction.
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
