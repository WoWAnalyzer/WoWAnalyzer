import React from 'react';
import PropTypes from 'prop-types';

import Chart from './Chart';

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

    const groupingInterval = Math.round(timeSpanMinutes / 1440);

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
          <Chart data={chartData} timeSpanMinutes={timeSpanMinutes} />
        </div>
      </div>
    );
  }
}

export default WclApiRequests;
