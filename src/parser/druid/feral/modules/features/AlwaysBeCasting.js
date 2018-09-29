import CoreAlwaysBeCasting from 'parser/core/modules/AlwaysBeCasting';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  suggestions(when) {
    // override the suggestions from CoreAlwaysBeCasting so there's never any generated, but we still get the statistic.
    return null;
  }
  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
