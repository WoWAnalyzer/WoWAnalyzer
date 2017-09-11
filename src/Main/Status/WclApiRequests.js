import React from 'react';
import PropTypes from 'prop-types';

import Chart  from './Chart';

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
          borderColor: 'rgba(75,192,192,1)',
          label: 'Requests',
          data: requests.reverse(),
        },
      ],
    };

    return (
      <div>
        <div className="graph-container">
          <Chart
            data={chartData}
            options={options => {
              options.tooltips.callbacks.label = item => `${item.yLabel} requests`;
              options.scales.yAxes[0].scaleLabel = {
                display: true,
                labelString: 'Requests',
              };
              return options;
            }}
          />
        </div>
      </div>
    );
  }
}

export default WclApiRequests;
