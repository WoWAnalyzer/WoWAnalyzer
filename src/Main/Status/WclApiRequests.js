import React from 'react';
import PropTypes from 'prop-types';
import ChartistGraph from 'react-chartist';
import Chartist from 'chartist';
import 'chartist-plugin-legend';

import './Chart.css';

class WclApiRequests extends React.PureComponent {
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
    const labelsPerHour = 720 / timeSpanMinutes;

    const requestsByMinute = {};
    history
      .forEach(moment => {
        requestsByMinute[moment.minutesAgo] = (requestsByMinute[moment.minutesAgo] || 0) + moment.numRequests;
      });

    const requests = [];
    const labels = [];
    for (let minutesAgo = 0; minutesAgo < timeSpanMinutes; minutesAgo += 1) {
      const numRequests = requestsByMinute[minutesAgo];
      requests.push(numRequests || 0);

      const date = new Date();
      date.setMinutes(date.getMinutes() - minutesAgo);
      labels.push(date);
    }

    const chartData = {
      labels: labels.reverse(),
      series: [
        {
          className: 'healing thin',
          name: 'Requests',
          data: requests.reverse(),
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
              },
              plugins: [
                Chartist.plugins.legend({
                  classNames: [
                    'healing',
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

export default WclApiRequests;
