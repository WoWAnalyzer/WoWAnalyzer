import React from 'react';
import PropTypes from 'prop-types';

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

    const groupingInterval = Math.max(1, Math.round(timeSpanMinutes / 1440));

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

    const chartData = {
      labels: labels.reverse(),
      datasets: [
        {
          borderColor: "rgba(75,192,192,1)",
          label: 'Average response time',
          data: avgResponseTimes.reverse(),
        },
        {
          borderColor: "rgba(192,0,0,1)",
          label: 'Max response time',
          data: maxResponseTimes.reverse(),
        },
      ],
    };

    return (
      <div>
        <div className="chart-container">
          <Chart
            data={chartData}
            options={options => {
              options.tooltips.callbacks.label = (item, data) => {
                console.log(item, data);
                const dataSetName = data.datasets[item.datasetIndex].label;
                return `${dataSetName}: ${formatThousands(item.yLabel)}ms`;
              };
              options.scales.yAxes[0].ticks.callback = time => `${formatThousands(time)}ms`;
              options.scales.yAxes[0].scaleLabel = {
                display: true,
                labelString: 'Response time',
              };
              return options;
            }}
          />
        </div>
      </div>
    );
  }
}

export default WclApiResponseTime;
