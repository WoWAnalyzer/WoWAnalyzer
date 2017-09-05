import React from 'react';
import PropTypes from 'prop-types';
import ChartistGraph from 'react-chartist';
import Chartist from 'chartist';
import 'chartist-plugin-legend';

import { formatThousands } from 'common/format';

import './Chart.css';

class WclApiResponseTime extends React.PureComponent {
  static propTypes = {
    history: PropTypes.array,
  };

  render() {
    const { history } = this.props;

    if (!history) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    const timeSpanMinutes = 24 * 60;
    const groupingInterval = 1;
    const labelsPerHour = 720 / timeSpanMinutes;

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
          <ChartistGraph
            data={chartData}
            options={{
              low: 0,
              showPoint: false,
              fullWidth: true,
              height: '350px',
              lineSmooth: Chartist.Interpolation.simple({
              }),
              axisX: {
                labelInterpolationFnc: function skipLabels(date) {
                  const minutes = date.getMinutes();
                  if (minutes === 0 || (labelsPerHour >= 2 && minutes === 30) || (labelsPerHour >= 4 && (minutes === 15 || minutes === 45))) {
                    const hours = date.getHours();
                    return `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
                  }
                  return null;
                },
                offset: 15,
              },
              axisY: {
                onlyInteger: true,
                offset: 60,
                labelInterpolationFnc: function skipLabels(responseTime) {
                  return `${formatThousands(responseTime)}ms`;
                },
              },
              plugins: [
                Chartist.plugins.legend({
                  classNames: [
                    'healing',
                    'mana-used',
                  ],
                }),
                // tooltips(),
              ],
            }}
            type="Line"
          />
        </div>
      </div>
    );
  }
}

export default WclApiResponseTime;
