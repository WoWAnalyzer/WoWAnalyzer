import React from 'react';
import ChartistGraph from 'react-chartist';
import Chartist from 'chartist';
import 'chartist-plugin-legend';

import specialEventIndicators from './Chartist/specialEventIndicators';
// import tooltips from './Chartist/toolips';

import WCL_API_KEY from './WCL_API_KEY';

import './Mana.css';

const formatDuration = (duration) => {
  const seconds = Math.floor(duration % 60);
  return `${Math.floor(duration / 60)}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

class Mana extends React.PureComponent {
  static propTypes = {
    reportCode: React.PropTypes.string.isRequired,
    actorId: React.PropTypes.number.isRequired,
    start: React.PropTypes.number.isRequired,
    end: React.PropTypes.number.isRequired,
  };

  constructor() {
    super();
    this.state = {
      mana: null,
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
    const manaPromise = fetch(`https://www.warcraftlogs.com/v1/report/tables/resources/${reportCode}?start=${start}&end=${end}&sourceid=${actorId}&abilityid=100&api_key=${WCL_API_KEY}`)
      .then(response => response.json())
      .then((json) => {
        console.log('Received mana', json);
        if (json.status === 400 || json.status === 401) {
          throw json.error;
        } else {
          this.setState({
            mana: json,
          });
        }
      });

    const bossHealthPromise = fetch(`https://www.warcraftlogs.com/v1/report/tables/resources/${reportCode}?start=${start}&end=${end}&sourceclass=Boss&hostility=1&abilityid=1000&api_key=${WCL_API_KEY}`)
      .then(response => response.json())
      .then((json) => {
        console.log('Received boss health', json);
        if (json.status === 400 || json.status === 401) {
          throw json.error;
        } else {
          this.setState({
            bossHealth: json,
          });
        }
      });

    return Promise.all([ manaPromise, bossHealthPromise ]);
  }

  render() {
    if (!this.state.mana || !this.state.bossHealth) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    const { start, end } = this.props;

    const manaBySecond = {
      0: 100,
    };
    this.state.mana.series[0].data.forEach((item) => {
      const secIntoFight = Math.floor((item[0] - start) / 1000);

      manaBySecond[secIntoFight] = item[1];
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
    this.state.mana.deaths.forEach((death) => {
      const secIntoFight = Math.floor((death.timestamp - start) / 1000);

      if (death.targetIsFriendly) {
        deathsBySecond[secIntoFight] = true;
      }
    });

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
      labels: labels,
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
        }
      ],
    };
    let step = 0;

    return (
      <div>
        Good mana usage usually means having your mana go down about as quickly as the health of the boss. Some fights require specific mana management though.<br /><br />

        <ChartistGraph
          data={chartData}
          options={{
            low: 0,
            high: 100,
            showArea: true,
            showPoint: false,
            fullWidth: true,
            height: '300px',
            lineSmooth: Chartist.Interpolation.none({
              fillHoles: true,
            }),
            axisX: {
              labelInterpolationFnc: function skipLabels(seconds) {
                if (seconds < ((step - 1) * 30)) {
                  step = 0;
                }
                if (step === 0 || seconds >= (step * 30)) {
                  step += 1;
                  return formatDuration(seconds);
                }
                return null;
              },
              offset: 20,
            },
            axisY: {
              onlyInteger: true,
              offset: 35,
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
    );
  }
}

export default Mana;
