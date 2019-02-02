//Based on Main/Mana.js and parser/VengeanceDemonHunter/Modules/PainChart
//Note: For those that might wish to add Boss Health in the future- some of the work is already done here: https://github.com/leapis/WoWAnalyzer/tree/focusChartBossHealth

import React from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';

import { formatDuration } from 'common/format';

class Maelstrom extends React.PureComponent {
  static propTypes = {
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    max: PropTypes.number,
    tracker: PropTypes.object,
  };

  render() {
    if (!this.props.tracker) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    const maxResource = this.props.tracker.maxResource || this.props.max;
    const { start, end } = this.props;


    const resourceBySecond = [];
    const overCapBySecond = [];
    this.props.tracker.resourceUpdates.forEach((item) => {
      const secIntoFight = Math.floor((item.timestamp - start) / 1000);
      resourceBySecond[secIntoFight] = item.current;
      overCapBySecond[secIntoFight] = item.waste;
    });


    const fightDurationSec = Math.ceil((end-start) / 1000);
    for (let i = 0; i <= fightDurationSec; i++) {
      resourceBySecond[i] = resourceBySecond[i] !== undefined ? resourceBySecond[i] : resourceBySecond[i-1];
      if (resourceBySecond[i] !== null) {
        resourceBySecond[i] = resourceBySecond[i] > 0 ? resourceBySecond[i] : 0;
      }
      overCapBySecond[i] = overCapBySecond[i] !== undefined ? overCapBySecond[i] : overCapBySecond[i-1];
    }

    let maxX;
    const myLabels = [];
    for (maxX = 0; maxX < resourceBySecond.length; maxX++) {
      if (maxX % 30 === 0) {
        myLabels[maxX] = (formatDuration(maxX));
      }
    }
    myLabels[maxX - 1] = formatDuration(maxX - 1);

    const myData = {
      labels: myLabels,
      datasets: [
        {
          label: 'Maelstrom',
          data: resourceBySecond,
          lineTension: 0.4,
          backgroundColor: [
            'rgba(0, 139, 215, 0.2)',
          ],
          borderColor: [
            'rgba(0,145,255,1)',
          ],
          borderWidth: 2,
        },
        {
          label: 'Wasted Maelstrom',
          data: overCapBySecond,
          lineTension: 0.4,
          backgroundColor: [
            'rgba(255,20,147, 0.3)',
          ],
          borderColor: [
            'rgba(255,90,160,1)',
          ],
          borderWidth: 2,
        },
      ],
    };
    const chartOptions = {
      lineTension: 0,
      elements: {
        point: { radius: 0 },
      },
      scales: {
        xAxes: [{
          ticks: {
            beginAtZero: true,
            autoSkip: false,
          },
          gridLines: {
            color: 'rgba(255,255,255,0.7)',
            borderDash: [2, 2],
          },
          position: 'bottom',
          beginAtZero: true,
        }],
        yAxes: [{
          gridLines: {
            color: 'rgba(255,255,255,0.7)',
            borderDash: [2, 2],
          },
          type: 'linear',
          ticks: {
            beginAtZero: true,
            stepSize: 30,
            max: maxResource,
          },
        }],
      },
    };

    return (
      <div>
        <Line
          data={myData}
          options={chartOptions}
          height={100}
          width={300}
        />
      </div>
    );

  }
}

export default Maelstrom;
