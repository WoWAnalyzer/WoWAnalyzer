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
  hasLegendary,
  hasConduit,
  optional,
} from 'parser/shared/metrics/apl/conditions';
import * as cnd from 'parser/shared/metrics/apl/conditions';

export const apl = build([
  SPELLS.BONEDUST_BREW_CAST,
  { spell: SPELLS.KEG_SMASH, condition: buffPresent(SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL) },
  { spell: SPELLS.BREATH_OF_FIRE, condition: hasLegendary(SPELLS.CHARRED_PASSIONS) },
  {
    spell: SPELLS.KEG_SMASH,
    condition: cnd.describe(
      cnd.and(
        hasLegendary(SPELLS.STORMSTOUTS_LAST_KEG),
        cnd.spellFractionalCharges(SPELLS.KEG_SMASH, { atLeast: 1.5 }),
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
    spell: SPELLS.KEG_SMASH,
    condition: cnd.describe(cnd.not(cnd.hasLegendary(SPELLS.STORMSTOUTS_LAST_KEG)), () => ''),
  },
  SPELLS.BLACKOUT_KICK_BRM,
  SPELLS.KEG_SMASH,
  SPELLS.FAELINE_STOMP_CAST,
  SPELLS.BREATH_OF_FIRE,
  {
    spell: SPELLS.RUSHING_JADE_WIND_TALENT,
    condition: buffMissing(SPELLS.RUSHING_JADE_WIND_TALENT, {
      timeRemaining: 2000,
      duration: 6000,
    }),
  },
  { spell: SPELLS.SPINNING_CRANE_KICK_BRM, condition: buffPresent(SPELLS.CHARRED_PASSIONS_BUFF) },
  SPELLS.CHI_WAVE_TALENT,
  SPELLS.CHI_BURST_TALENT,
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
        get you an extra cast of <SpellLink id={SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id} /> that lines
        up with incoming damage. We cannot check this automatically, and be warned that it is a
        small defensive loss due to the loss of Brew cooldown reduction.
      </>,
    ),
  },
  SPELLS.TIGER_PALM,
]);

export const check = aplCheck(apl);

export default suggestion((events, info) => {
  const { successes, violations } = check(events, info);
  console.log(events.filter((event) => event.timestamp === 6801836));
  console.log(violations.filter((v) => v.actualCast.timestamp === 6801836));
  console.log(successes.length, violations.length);
  console.log(successes.map((r) => r.actualCast.timestamp));
  annotateTimeline(violations);

  return undefined;
});
