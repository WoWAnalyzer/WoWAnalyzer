import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js';
import {Line} from 'react-chartjs-2';

import fetchWcl from 'common/fetchWcl';

import ManaStyles from 'Main/ManaStyles.js';

const formatDuration = (duration) => {
  const seconds = Math.floor(duration % 60);
  return `${Math.floor(duration / 60)}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

class Mana extends React.PureComponent {
  static propTypes = {
    reportCode: PropTypes.string.isRequired,
    actorId: PropTypes.number.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    manaUpdates: PropTypes.object.isRequired,
  };

  constructor() {
    super();
    this.state = {
      bossHealth: null,
    };
  }

  componentWillMount() {
    this.load(this.props.reportCode, this.props.actorId, this.props.start, this.props.end);
  }
  componentWillReceiveProps(newProps) {
    if (newProps.reportCode !== this.props.reportCode || newProps.actorId !== this.props.actorId || newProps.start !== this.props.start || newProps.end !== this.props.end) {
      this.load(newProps.reportCode, newProps.actorId, newProps.start, newProps.end);
    }
  }

  load(reportCode, actorId, start, end) {
    return fetchWcl(`report/tables/resources/${reportCode}`, {
      start,
      end,
      sourceclass: 'Boss',
      hostility: 1,
      abilityid: 1000,
    })
      .then(json => {
        console.log('Received boss health', json);
        this.setState({
          bossHealth: json,
        });
      });
  }

  render() {
    if (!this.state.bossHealth) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    const { start, end, manaUpdates } = this.props;

    const manaBySecond = {
      0: 100,
    };
    manaUpdates.forEach((item) => {
      const secIntoFight = Math.floor((item.timestamp - start) / 1000);

      manaBySecond[secIntoFight] = item.current / item.max * 100;
    });
    const bosses = [];
    const deadBosses = [];
    this.state.bossHealth.series.forEach((series) => {
      const newSeries = {
        ...series,
        data: {},
      };

      series.data.forEach((item) => {
        const secIntoFight = Math.floor((item[0] - start) / 1000);

        if (deadBosses.indexOf(series.guid) === -1) {
          const health = item[1];
          newSeries.data[secIntoFight] = health;

          if (health === 0) {
            deadBosses.push(series.guid);
          }
        }
      });
      bosses.push(newSeries);
    });
    const deathsBySecond = {};
    if (this.state.bossHealth.deaths) {
      this.state.bossHealth.deaths.forEach((death) => {
        const secIntoFight = Math.floor((death.timestamp - start) / 1000);

        if (death.targetIsFriendly) {
          deathsBySecond[secIntoFight] = true;
        }
      });
    }

    const fightDurationSec = Math.ceil((end - start) / 1000);
    const labels = [];
    for (let i = 0; i <= fightDurationSec; i += 1) {
      labels.push(i);

      manaBySecond[i] = manaBySecond[i] !== undefined ? manaBySecond[i] : null;
      bosses.forEach((series) => {
        series.data[i] = series.data[i] !== undefined ? series.data[i] : null;
      });
      deathsBySecond[i] = deathsBySecond[i] !== undefined ? deathsBySecond[i] : undefined;
    }

    const data = {
      labels,
      datasets: [
        ...bosses.map((series, index) => ({
          label: `${series.name} Health`,
          ...ManaStyles[`Boss-${index}`],
          ...ManaStyles[`Boss-${series.guid}`],
          data: Object.keys(series.data).map(key => series.data[key]),
        })),
        {
          label: `Deaths`,
          ...ManaStyles.Deaths,
          data: Object.keys(deathsBySecond).map(key => deathsBySecond[key]),
        },
        {
          label: `Mana`,
          ...ManaStyles.Mana,
          data: Object.keys(manaBySecond).map(key => manaBySecond[key]),
        },
      ],
    };

    const gridLines = ManaStyles.gridLines;

    const options = {
      responsive: true,
      scales: {
        yAxes: [{
          gridLines: gridLines,
          ticks: {
            callback: (value, index, values) => {
              return `${value}%`;
            },
            min: 0,
            max: 100,
            stepSize: 25,
            fontSize: 14,
          },
        }],
        xAxes: [{
          gridLines: gridLines,
          ticks: {
            callback: (value, index, values) => {
              if(value%30 === 0) {
                return formatDuration(value);
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

    Chart.plugins.register({
      id: 'specialEventIndiactor',
      afterDatasetsDraw : (chart) => {
        const ctx = chart.ctx;

        chart.data.datasets.forEach(function(dataset, i) {
          const meta = chart.getDatasetMeta(i);
          if(dataset.label === 'Deaths' && !meta.hidden) {
            meta.data.forEach(function(element, index) {
              const position = element.tooltipPosition();
              if(!isNaN(position.y)) {
                  ctx.strokeStyle=element._view.borderColor;
                  ctx.beginPath();
                  ctx.lineWidth = ManaStyles.Deaths.borderWidth;
                  ctx.moveTo(position.x, chart.chartArea.top);
                  ctx.lineTo(position.x, chart.chartArea.bottom);
                  ctx.stroke();
              }
            });
          }
        });

      },
    });

    return (
      <div>
        Good mana usage usually means having your mana go down about as quickly as the health of the boss. Some fights require specific mana management though.<br /><br />

        <div className="graph-container">
          <Line
            data={data}
            options={options}
            width={1100}
            height={400}
          />
        </div>
      </div>
    );
  }
}

export default Mana;

