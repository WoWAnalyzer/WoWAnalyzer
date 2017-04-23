import React from 'react';
import ChartistGraph from 'react-chartist';
import Chartist from 'chartist';
import 'chartist-plugin-legend';

import specialEventIndicators from './Chartist/specialEventIndicators';

import WCL_API_KEY from './WCL_API_KEY';

const formatDuration = (duration) => {
  const seconds = Math.floor(duration % 60);
  return `${Math.floor(duration / 60)}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

class Mana extends React.PureComponent {
  static propTypes = {

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
      return <div>Loading...</div>;
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
    const deaths = [];
    this.state.mana.deaths.forEach((death) => {
      const secIntoFight = Math.floor((death.timestamp - start) / 1000);

      if (death.targetIsFriendly) {
        deaths.push({
          x: secIntoFight,
          label: "Someone died",
        });
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
    }

    const chartData = {
      labels: labels,
      series: [
        ...bosses.map((series, index) => ({
          className: `boss-health boss-${index} boss-${series.guid}`,
          name: `${series.name} Health`,
          data: Object.values(series.data),
        })),
        {
          className: 'mana',
          name: 'Mana',
          data: Object.values(manaBySecond),
        },
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
                ],
              }),
              specialEventIndicators({
                series: [
                  {
                    className: 'death',
                    data: deaths,
                  }
                ],
              }),
            ],
          }}
          type="Line"
        />
        <style type="text/css">{`
.ct-legend {
  position: relative;
  z-index: 10;
  list-style: none;
  text-align: center;
  margin-bottom: 0;
}
.ct-legend li {
  position: relative;
  padding-left: 19px;
  margin-right: 10px;
  margin-bottom: 3px;
  cursor: pointer;
  display: inline-block;
}
.ct-legend li:before {
  width: 12px;
  height: 12px;
  position: absolute;
  top: .3em;
  left: 0;
  content: '';
  border: 3px solid transparent;
  border-radius: 2px;
}
.ct-legend li.inactive:before {
  background: transparent;
}
.ct-legend.ct-legend-inside {
  position: absolute;
  top: 0;
  right: 0;
}
.ct-legend.ct-legend-inside li{
  display: block;
  margin: 0;
}

.ct-line {
  stroke-width: 2px;
}
.ct-grid {
	stroke: rgba(255, 255, 255, 0.2);
}
.ct-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1em;
  line-height: 1;
}
.ct-label.ct-vertical {
	line-height: 0;
}

.ct-series.mana .ct-bar, .ct-series.mana .ct-line, .ct-series.mana .ct-point, .ct-series.mana .ct-slice-donut {
	stroke: #026dd7;
}
.ct-series.mana .ct-area, .ct-series.mana .ct-slice-donut-solid, .ct-series.mana .ct-slice-pie {
  fill: #022ad7;
  fill-opacity: 0.2;
}
.ct-legend .mana:before {
  background-color: #026dd7;
  border-color: #026dd7;
}
.ct-series.boss-health .ct-line {
	stroke: #d70206;
}
.ct-series.boss-health .ct-area {
  fill: #d70206;
}
.ct-legend .boss-health:before {
  background-color: #d70206;
  border-color: #d70206;
}
.ct-series.boss-health.boss-1 .ct-line {
	stroke: #ff6638;
}
.ct-series.boss-health.boss-1 .ct-area {
  fill: #ff6638;
}
.ct-legend .boss-health.boss-1:before {
  background-color: #ff6638;
  border-color: #ff6638;
}
.ct-series.boss-health.boss-2 .ct-line {
	stroke: #ffd3bf;
}
.ct-series.boss-health.boss-2 .ct-area {
  fill: #ffd3bf;
}
.ct-legend .boss-health.boss-2:before {
  background-color: #ffd3bf;
  border-color: #ffd3bf;
}
/* Naturalist Tel'arn*/
.ct-series.boss-health.boss-109041 .ct-line {
	stroke: #99c439;
}
.ct-series.boss-health.boss-109041 .ct-area {
  fill: #000;
}
.ct-legend .boss-health.boss-109041:before {
  background-color: #99c439;
  border-color: #99c439;
}
/* Arcanist Tel'arn*/
.ct-series.boss-health.boss-109040 .ct-line {
	stroke: #564cac;
}
.ct-series.boss-health.boss-109040 .ct-area {
  fill: #000;
}
.ct-legend .boss-health.boss-109040:before {
  background-color: #564cac;
  border-color: #564cac;
}
/* Solarist Tel'arn*/
.ct-series.boss-health.boss-109038 .ct-line {
	stroke: #f3ea8f;
}
.ct-series.boss-health.boss-109038 .ct-area {
  fill: #000;
}
.ct-legend .boss-health.boss-109038:before {
  background-color: #f3ea8f;
  border-color: #f3ea8f;
}
.ct-chart-line .death {
	stroke: #ff0000;
	stroke-width: 1px;
}
`}</style>
      </div>
    );
  }
}

export default Mana;
