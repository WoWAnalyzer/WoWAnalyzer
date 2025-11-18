import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import { Options } from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import EarlyDotRefreshesCore from 'parser/shared/modules/earlydotrefreshes/EarlyDotRefreshes';

const DOTS = [
  {
    name: 'Rend',
    debuffId: SPELLS.REND_DOT_ARMS.id,
    castId: TALENTS.REND_ARMS_TALENT.id,
    duration: 21000,
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
}

export default RendAnalyzer;
