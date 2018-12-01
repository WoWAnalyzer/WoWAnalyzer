import React from 'react';

import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import Statistic from 'interface/report/Results/statistics/Statistic';

import RadarChart, { maxDataValue } from '../../../interface/report/Results/statistics/RadarChart';

/**
 * @property {StatTracker} statTracker
 */
class StatDisplay extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  statistic() {
    const data = [
      [
        { axis: 'Critical Strike', value: this.statTracker.critPercentage(this.statTracker.startingCritRating) },
        { axis: 'Haste', value: this.statTracker.hastePercentage(this.statTracker.startingHasteRating) },
        { axis: 'Mastery', value: this.statTracker.masteryPercentage(this.statTracker.startingMasteryRating) },
        { axis: 'Versatility', value: this.statTracker.versatilityPercentage(this.statTracker.startingVersatilityRating) },
        { axis: 'Leech', value: this.statTracker.leechPercentage(this.statTracker.startingLeechRating) },
      ],
    ];
    // Make it easy to read by making each level (each background circle) 10%
    const levels = Math.ceil(maxDataValue(data) / 0.1);
    const maxValue = levels * 0.1;

    return (
      <Statistic position={10} large wide>
        <div className="text-center">
          <RadarChart
            width={300}
            height={280}
            data={data}
            maxValue={maxValue}
            levels={levels}
            labelFormatter={value => `${formatPercentage(value, 0)}%`}
            labelMaxWidth={100} // Don't wrap "Critical Strike"
            opacityCircles={0.05} // Gray on a dark background needs more opacity to look ok
            margin={{ top: 40, right: 40, left: 40, bottom: 10 }} // because we have 5 axis, the bottom labels are further up than the top label. This makes the chart *appear* uncentered even though technically it is centered.
          />
        </div>
      </Statistic>
    );
  }
}

export default StatDisplay;
