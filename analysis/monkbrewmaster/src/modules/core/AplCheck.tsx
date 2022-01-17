import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { WIPSuggestionFactory } from 'parser/core/CombatLogParser';
import { EventType } from 'parser/core/Events';
import aplCheck, { build } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import {
  targetsHit,
  buffPresent,
  buffMissing,
  hasLegendary,
  hasConduit,
  optional,
} from 'parser/shared/metrics/apl/conditions';

export const apl = build([
  SPELLS.BONEDUST_BREW_CAST,
  { spell: SPELLS.KEG_SMASH, condition: buffPresent(SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL) },
  { spell: SPELLS.BREATH_OF_FIRE, condition: hasLegendary(SPELLS.CHARRED_PASSIONS) },
  SPELLS.KEG_SMASH,
  SPELLS.BLACKOUT_KICK_BRM,
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

const brmApl = (): WIPSuggestionFactory => (events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
};

export default brmApl;
