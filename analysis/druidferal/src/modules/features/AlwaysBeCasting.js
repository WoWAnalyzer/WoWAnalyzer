import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  position = STATISTIC_ORDER.CORE(1);

  suggestions(when) {
    // override the suggestions from CoreAlwaysBeCasting so there's never any generated, but we still get the statistic.
    return null;
  }
}

export default AlwaysBeCasting;
