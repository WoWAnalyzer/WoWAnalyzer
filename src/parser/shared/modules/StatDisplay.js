import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import Statistic from 'interface/report/Results/statistics/Statistic';

/**
 * @property {StatTracker} statTracker
 */
class StatDisplay extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  statistic() {
    return (
      <Statistic position={10} large wide>
        <div className="text-center">
        </div>
      </Statistic>
    );
  }
}

export default StatDisplay;
