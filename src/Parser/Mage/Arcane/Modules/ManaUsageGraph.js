import React from 'react';
import PropTypes from 'prop-types';
import {Line} from 'react-chartjs-2';

import {formatThousands } from 'common/format';
import {formatDuration} from 'common/format';

import ManaStyles from 'Main/ManaStyles.js';

const baseConfig = {
  responsive: true,
  scales: {
    yAxes: [{
      gridLines: ManaStyles.gridLines,
      ticks: {
        callback: (percentage, index, values) => {
          return formatThousands(percentage);
        },
        fontSize: 14,
      },
    }],
    xAxes: [{
      gridLines: ManaStyles.gridLines,
      ticks: {
        callback: (seconds, index, values) => {
          if (seconds % 30 === 0) {
            return formatDuration(seconds);
          }
          return null;
        },
        fontSize: 14,
      },
    }],
  },
  animation: {
    duration: 0,
  },
  hover: {
    animationDuration: 0,
  },
  responsiveAnimationDuration: 0,
  tooltips: {
    enabled: false,
  },
  legend: ManaStyles.legend,
};

class DamageDoneGraph extends React.PureComponent {
  static propTypes = {
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    damageBySecond: PropTypes.object.isRequired,
    manaUpdates: PropTypes.array.isRequired,
  };

  constructor() {
    super();
    this.state = {
      interval: 5,
    };
  }

  groupDamageBySeconds(damageBySecond, interval) {
    return Object.keys(damageBySecond)
      .reduce((obj, second) => {
        const damage = damageBySecond[second];

        const index = Math.floor(second / interval);

        if (obj[index]) {
          obj[index] = obj[index].add(damage.regular, damage.absorbed);
        } else {
          obj[index] = damage;
        }
        return obj;
      }, {});
  }

  render() {
    const { start, end, damageBySecond, manaUpdates } = this.props;

    const interval = this.state.interval;
    const damagePerFrame = this.groupDamageBySeconds(damageBySecond, interval);

    let max = 0;
    Object.keys(damagePerFrame)
      .map(k => damagePerFrame[k])
      .forEach((damageDone) => {
        const current = damageDone.effective;
        if (current > max) {
          max = current;
        }
      });
    max /= interval;

    const manaUsagePerFrame = {
      0: 0,
    };
    const manaLevelPerFrame = {
      0: 100,
    };
    manaUpdates.forEach((item) => {
      const frame = Math.floor((item.timestamp - start) / 1000 / interval);

      manaUsagePerFrame[frame] = (manaUsagePerFrame[frame] || 0) + item.used / item.max;
      manaLevelPerFrame[frame] = item.current / item.max; // use the lowest value of the frame; likely to be more accurate
    });
    const fightDurationSec = Math.ceil((end - start) / 1000);
    const labels = [];
    for (let i = 0; i <= fightDurationSec / interval; i += 1) {
      labels.push(i * interval);

      damagePerFrame[i] = damagePerFrame[i] !== undefined ? damagePerFrame[i].effective : 0;
      manaUsagePerFrame[i] = manaUsagePerFrame[i] !== undefined ? manaUsagePerFrame[i] : 0;
      manaLevelPerFrame[i] = manaLevelPerFrame[i] !== undefined ? manaLevelPerFrame[i] : null;
    }

    const chartData = {
      labels,
      datasets: [
        {
          label: `Mana`,
          ...ManaStyles.Mana,
          data: Object.keys(manaLevelPerFrame).map(key => manaLevelPerFrame[key] !== null ? manaLevelPerFrame[key] * max : null),
        },
        {
          label: `DPS`,
          ...ManaStyles.DPS,
          data: Object.keys(damagePerFrame).map(key => damagePerFrame[key] !== null ? damagePerFrame[key] / interval : null),
        },
      ],
    };

    return (
      <div>
        <div className="flex">
          <div className="flex-main">
            This shows you your mana usage in correlation with your throughput. Big spikes in mana usage without increases in throughput may indicate poor mana usage. The scale for both mana lines is 0-100% where 100% is aligned with the max HPS throughput.
          </div>
          <div className="flex-sub form-inline">
            <dfn data-tip="This groups events by the provided amount of seconds to smooth out the graph.">Smoothing</dfn>: <input type="number" min="1" max="30" value={interval} className="form-control" onChange={e => this.setState({ interval: Number(e.target.value) || 5 })} /> seconds
          </div>
        </div>

        <div className="graph-container">
          <Line
            data={chartData}
            options={baseConfig}
            width={1100}
            height={400}
          />
        </div>
      </div>
    );
  }
}

export default DamageDoneGraph;
