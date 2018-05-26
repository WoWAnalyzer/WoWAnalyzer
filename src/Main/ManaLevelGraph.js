import React from 'react';
import PropTypes from 'prop-types';
import ChartistGraph from 'react-chartist';
import Chartist from 'chartist';
import 'chartist-plugin-legend';

import fetchWcl from 'common/fetchWcl';

import specialEventIndicators from './Chartist/specialEventIndicators';

import './Mana.css';

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

        if (!deadBosses.includes(series.guid)) {
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

    const chartData = {
      labels,
      series: [
        ...bosses.map((series, index) => ({
          className: `boss-health boss-${index} boss-${series.guid}`,
          name: `${series.name} Health`,
          data: Object.keys(series.data).map(key => series.data[key]),
        })),
        {
          className: 'mana',
          name: 'Mana',
          data: Object.keys(manaBySecond).map(key => manaBySecond[key]),
        },
        {
          className: 'death',
          name: 'Deaths',
          data: Object.keys(deathsBySecond).map(key => deathsBySecond[key]),
        },
      ],
    };
    return (
      <div>
        Good mana usage usually means having your mana go down about as quickly as the health of the boss. Some fights require specific mana management though.<br /><br />

        <div className="graph-container">
          <ChartistGraph
            data={chartData}
            options={{
              low: 0,
              high: 100,
              showArea: true,
              showPoint: false,
              fullWidth: true,
              height: '350px',
              lineSmooth: Chartist.Interpolation.simple({
                fillHoles: true,
              }),
              axisX: {
                labelInterpolationFnc: function skipLabels(seconds) {
                  if (seconds % 30 === 0) {
                    return formatDuration(seconds);
                  }
                  return null;
                },
                offset: 15,
              },
              axisY: {
                onlyInteger: true,
                offset: 40,
                labelInterpolationFnc: function skipLabels(percentage) {
                  return `${percentage}%`;
                },
              },
              plugins: [
                Chartist.plugins.legend({
                  classNames: [
                    ...bosses.map((series, index) => `boss-health boss-${index} boss-${series.guid}`),
                    'mana',
                    'death',
                  ],
                }),
                specialEventIndicators({
                  series: ['death'],
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

export default Mana;
