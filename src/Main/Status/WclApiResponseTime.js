import React from 'react';
import PropTypes from 'prop-types';
import { Line as LineChart } from 'react-chartjs-2';

import { formatThousands } from 'common/format';

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
          className: 'healing thin',
          label: 'Average response time',
          data: avgResponseTimes.reverse(),
          lineTension: 0,
          showLine: false,
        },
        {
          className: 'mana-used thin',
          label: 'Max response time',
          data: maxResponseTimes.reverse(),
          lineTension: 0,
          showLine: false,
        },
      ],
    };
    {/*<Chart*/}
      {/*data={chartData}*/}
      {/*timeSpanMinutes={timeSpanMinutes}*/}
      {/*options={{*/}
        {/*axisY: {*/}
          {/*onlyInteger: true,*/}
          {/*offset: 60,*/}
          {/*labelInterpolationFnc: responseTime => `${formatThousands(responseTime)}ms`,*/}
        {/*},*/}
      {/*}}*/}
    {/*/>*/}
    const labelsPerHour = 720 / timeSpanMinutes;
    const dayLabels = timeSpanMinutes > 1440;
    let previousDay = null;
    return (
      <div>
        <div className="chart-container">
          <LineChart
            data={chartData}
            options={{
              animation: {
                duration: 0, // general animation time
              },
              hover: {
                animationDuration: 0, // duration of animations when hovering an item
              },
              responsiveAnimationDuration: 0, // animation duration after a resize
              responsive: true,
              maintainAspectRatio: false,
            }}
            height={350}
          />
        </div>
      </div>
    );
  }
}

export default WclApiResponseTime;
