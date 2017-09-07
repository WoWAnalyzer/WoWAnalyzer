import React from 'react';
import PropTypes from 'prop-types';
import { Line as LineChart, defaults } from 'react-chartjs-2';

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

defaults.global.defaultFontColor = '#fff';

class WclApiRequests extends React.PureComponent {
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

    const requestsByMinute = {};
    history
      .forEach(moment => {
        const intervalIndex = Math.floor(moment.minutesAgo / groupingInterval);
        requestsByMinute[intervalIndex] = (requestsByMinute[intervalIndex] || 0) + moment.numRequests;
      });

    const requests = [];
    const labels = [];
    for (let i = 0; i < Math.floor(timeSpanMinutes / groupingInterval); i += 1) {
      const numRequests = requestsByMinute[i];
      requests.push(numRequests || 0);

      const date = new Date();
      date.setMinutes(date.getMinutes() - (i * groupingInterval));
      labels.push(date);
    }

    const chartData = {
      labels: labels.reverse(),
      datasets: [
        {
          borderColor: "rgba(75,192,192,1)",
          label: 'Requests',
          data: requests.reverse(),
        },
      ],
    };

    const labelsPerHour = 720 / timeSpanMinutes;
    const dayLabels = timeSpanMinutes > 1440;
    let previousDay = null;

    return (
      <div>
        <div className="graph-container">
          <LineChart
            data={chartData}
            options={{
              maintainAspectRatio: false,
              elements: {
                line: {
                  tension: 0,
                  borderWidth: 1,
                },
                point: {
                  radius: 0,
                  hitRadius: 10,
                  hoverRadius: 10,
                },
              },
              tooltips: {
                mode: 'nearest',
              },
              scales: {
                xAxes: [{
                  ticks: {
                    callback: function(date, index, values) {
                      if (dayLabels) {
                        const day = date.getDay();
                        // By only showing the label on the first hour of day we only really show the first label if there's enough space
                        const firstHour = date.getHours() === 0;
                        if (firstHour && (previousDay === null || day !== previousDay)) {
                          previousDay = day;
                          return DAY_LABELS[day];
                        }
                      } else {
                        const minutes = date.getMinutes();
                        if (minutes === 0 || (labelsPerHour >= 2 && minutes === 30) || (labelsPerHour >= 4 && (minutes === 15 || minutes === 45))) {
                          const hours = date.getHours();
                          return `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
                        }
                      }
                      return null;
                    },
                    autoSkip: false,
                  },
                  gridLines: {
                    color: 'rgba(255, 255, 255, 0.1)',
                  },
                }],
                yAxes: [{
                  display: true,
                  scaleLabel: {
                    display: true,
                    labelString: 'Requests',
                  },
                  ticks: {
                    beginAtZero: true,
                  },
                  gridLines: {
                    color: 'rgba(255, 255, 255, 0.1)',
                  },
                }],
              },
            }}
            height={350}
            redraw
          />
        </div>
      </div>
    );
  }
}

export default WclApiRequests;
