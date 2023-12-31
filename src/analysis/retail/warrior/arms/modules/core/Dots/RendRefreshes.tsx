import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { SpellLink } from 'interface';
import { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import EarlyDotRefreshesCore from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshes';

const DOTS = [
  {
    name: 'Rend',
    debuffId: SPELLS.REND_DOT_ARMS.id,
    castId: TALENTS.REND_ARMS_TALENT.id,
    duration: 15000,
  },
];

const MINOR_THRESHOLD = 0.9;
const AVERAGE_THRESHOLD = 0.8;
const MAJOR_THRESHOLD = 0.7;

class RendAnalyzer extends EarlyDotRefreshesCore {
  get suggestionThresholdsRendEfficiency() {
    return {
      spell: SPELLS.MORTAL_STRIKE,
      count: this.casts[DOTS[0].castId].badCasts,
      wastedDuration: this.casts[DOTS[0].castId].wastedDuration,
      actual: this.badCastsEffectivePercent(DOTS[0].castId),
      isLessThan: {
        minor: MINOR_THRESHOLD,
        average: AVERAGE_THRESHOLD,
        major: MAJOR_THRESHOLD,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dots = DOTS;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.REND_ARMS_TALENT);
  }

  suggestions(when: When) {
    when(this.suggestionThresholdsRendEfficiency).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You refreshed <SpellLink spell={TALENTS.REND_ARMS_TALENT} icon /> early{' '}
          {this.suggestionThresholdsRendEfficiency.count} times.
        </>,
      )
        .icon(TALENTS.REND_ARMS_TALENT.icon)
        .actual(
          defineMessage({
            id: 'shared.suggestions.dots.badRendRefreshes',
            message: `${formatPercentage(actual)}% of good Rend refreshes.`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default RendAnalyzer;
