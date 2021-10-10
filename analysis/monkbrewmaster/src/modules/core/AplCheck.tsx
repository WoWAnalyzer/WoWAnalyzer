import SPELLS from 'common/SPELLS';
import { WIPSuggestionFactory } from 'parser/core/CombatLogParser';
import aplCheck, { build } from 'parser/shared/metrics/apl';
import annotateTimeline from 'parser/shared/metrics/apl/annotate';
import { buffPresent, buffMissing } from 'parser/shared/metrics/apl/buffPresent';
import hasLegendary from 'parser/shared/metrics/apl/conditions/hasLegendary';

const apl = build([
  { spell: SPELLS.KEG_SMASH, condition: buffPresent(SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL) },
  { spell: SPELLS.BREATH_OF_FIRE, condition: hasLegendary(SPELLS.CHARRED_PASSIONS) },
  SPELLS.BLACKOUT_KICK_BRM,
  SPELLS.KEG_SMASH,
  SPELLS.BREATH_OF_FIRE,
  {
    spell: SPELLS.RUSHING_JADE_WIND_TALENT,
    condition: buffMissing(SPELLS.RUSHING_JADE_WIND_TALENT),
  },
  { spell: SPELLS.SPINNING_CRANE_KICK_BRM, condition: buffPresent(SPELLS.CHARRED_PASSIONS_BUFF) },
  SPELLS.TIGER_PALM,
]);

const check = aplCheck(apl);

const brmApl = (): WIPSuggestionFactory => (events, info) => {
  const { violations } = check(events, info);
  annotateTimeline(violations);

  return undefined;
};

export default brmApl;
