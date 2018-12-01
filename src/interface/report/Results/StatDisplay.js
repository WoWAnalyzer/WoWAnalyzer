import React from 'react';
import PropTypes from 'prop-types';

import { formatPercentage } from 'common/format';
import StatTracker from 'parser/shared/modules/StatTracker';
import RadarChart, { maxDataValue } from 'interface/report/Results/statistics/RadarChart';

class StatDisplay extends React.PureComponent {
  static propTypes = {
    statTracker: PropTypes.objectOf(StatTracker).isRequired,
  };

  render() {
    const { statTracker, ...others } = this.props;

    const data = [
      {
        color: '#f8b700',
        points: [
          { axis: 'Critical Strike', value: statTracker.critPercentage(statTracker.startingCritRating) },
          { axis: 'Haste', value: statTracker.hastePercentage(statTracker.startingHasteRating) },
          { axis: 'Mastery', value: statTracker.masteryPercentage(statTracker.startingMasteryRating) },
          { axis: 'Versatility', value: statTracker.versatilityPercentage(statTracker.startingVersatilityRating) },
          { axis: 'Leech', value: statTracker.leechPercentage(statTracker.startingLeechRating) },
        ],
      },
    ];
    // Make it easy to read by making each level (each background circle) 10%
    const levels = Math.ceil(maxDataValue(data) / 0.1);
    const maxValue = levels * 0.1;

    return (
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
        {...others}
      />
    );
  }
}

export default StatDisplay;
