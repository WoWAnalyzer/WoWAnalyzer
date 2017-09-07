import React from 'react';
import PropTypes from 'prop-types';
import 'chartist-plugin-legend';

import { formatThousands } from 'common/format';

import Chart from './Chart';

class WclApiResponseTime extends React.PureComponent {
  static propTypes = {
    history: PropTypes.array,
    timeSpanMinutes: PropTypes.number.isRequired,
  };

  render() {
    const { history, timeSpanMinutes } = this.props;

    if (!history) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    const groupingInterval = Math.round(timeSpanMinutes / 1440);

    const historyByInterval = {};
    history
      .forEach(moment => {
        const intervalIndex = Math.floor(moment.minutesAgo / groupingInterval);
        const existingItem = historyByInterval[intervalIndex];
        if (existingItem) {
          const totalNumRequests = existingItem.numRequests + moment.numRequests;
          const totalResponseTime = existingItem.avgResponseTime * existingItem.numRequests + moment.avgResponseTime * moment.numRequests;
          const averageResponseTime = totalResponseTime / totalNumRequests;
          const maxResponseTime = Math.max(existingItem.maxResponseTime, moment.maxResponseTime);
          historyByInterval[intervalIndex] = {
            numRequests: totalNumRequests,
            avgResponseTime: averageResponseTime,
            maxResponseTime: maxResponseTime,
          };
        } else {
          historyByInterval[intervalIndex] = moment;
        }
      });

    const avgResponseTimes = [];
    const maxResponseTimes = [];
    const labels = [];
    for (let i = 0; i < Math.floor(timeSpanMinutes / groupingInterval); i += 1) {
      const item = historyByInterval[i];
      avgResponseTimes.push(item ? item.avgResponseTime : null);
      maxResponseTimes.push(item ? item.maxResponseTime : null);

      const date = new Date();
      date.setMinutes(date.getMinutes() - (i * groupingInterval));
      labels.push(date);
    }

    console.log(labels);

    const chartData = {
      labels: labels.reverse(),
      series: [
        {
          className: 'healing thin',
          name: 'Average response time',
          data: avgResponseTimes.reverse(),
        },
        {
          className: 'mana-used thin',
          name: 'Max response time',
          data: maxResponseTimes.reverse(),
        },
      ],
    };
    return (
      <div>
        <div className="graph-container">
          <Chart
            data={chartData}
            timeSpanMinutes={timeSpanMinutes}
            options={{
              axisY: {
                onlyInteger: true,
                offset: 60,
                labelInterpolationFnc: responseTime => `${formatThousands(responseTime)}ms`,
              },
            }}
          />
        </div>
      </div>
    );
  }
}

export default WclApiResponseTime;
