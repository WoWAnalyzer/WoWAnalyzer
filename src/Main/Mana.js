import React from 'react';
import ChartistGraph from 'react-chartist';
import Chartist from 'chartist';
import 'chartist-plugin-legend';

import WCL_API_KEY from './WCL_API_KEY';

const formatDuration = (duration) => {
  const seconds = Math.floor(duration % 60);
  return `${Math.floor(duration / 60)}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

class Mana extends React.Component {
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

    const data = [];
    this.state.mana.series[0].data.forEach((item) => {
      data.push({
        type: 'mana',
        label: item[0] - this.props.start,
        value: item[1],
      });
    });
    this.state.bossHealth.series[0].data.forEach((item) => {
      data.push({
        type: 'bossHealth',
        label: item[0] - this.props.start,
        value: item[1],
      });
    });

    const labels = [];
    const manaSeries = [];
    const bossHealthSeries = [];

    // TODO: Normalize the amount of steps per 30 seconds
    data
      .sort((a, b) => a.label - b.label)
      .forEach((item) => {
        labels.push(item.label);
        switch (item.type) {
          case 'mana':
            manaSeries.push(item.value);
            bossHealthSeries.push(null);
            break;
          case 'bossHealth':
            manaSeries.push(null);
            bossHealthSeries.push(item.value);
            break;
          default: break;
        }
      });

    const chartData = {
      labels: labels,
      series: [
        {
          className: 'boss-health',
          name: 'Boss Health',
          data: bossHealthSeries,
        },
        {
          className: 'mana',
          name: 'Mana',
          data: manaSeries,
        },
      ],
    };
    let step = 0;

    return (
      <div>
        Good mana usage usually means having your mana go down about as quickly as the health of the boss. Some fights require specific mana management though.<br />

        <ChartistGraph
          data={chartData}
          options={{
            low: 0,
            high: 100,
            showArea: true,
            showPoint: false,
            fullWidth: true,
            height: '300px',
            lineSmooth: Chartist.Interpolation.cardinal({
              fillHoles: true,
            }),
            axisX: {
              labelInterpolationFnc: function skipLabels(value, index) {
                const seconds = Math.round(value / 1000);
                if (seconds < ((step - 1) * 30)) {
                  step = 0;
                }
                if (step === 0 || seconds >= (step * 30)) {
                  step += 1;
                  return formatDuration(seconds);
                }
                return null;
              },
              offset: 25,
            },
            axisY: {
              onlyInteger: true,
              offset: 35,
            },
            plugins: [
              Chartist.plugins.legend({
                classNames: ['boss-health', 'mana'],
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
.ct-series.mana .ct-bar, .ct-series.mana .ct-line, .ct-series.mana .ct-point, .ct-series.mana .ct-slice-donut {
	stroke: #026dd7;
}
.ct-series.mana .ct-area, .ct-series.mana .ct-slice-donut-solid, .ct-series.mana .ct-slice-pie {
  fill: #022ad7;
}
.ct-legend .mana:before {
  background-color: #026dd7;
  border-color: #026dd7;
}
.ct-series.boss-health .ct-bar, .ct-series.boss-health .ct-line, .ct-series.boss-health .ct-point, .ct-series.boss-health .ct-slice-donut {
	stroke: #d70206;
}
.ct-series.boss-health .ct-area, .ct-series.boss-health .ct-slice-donut-solid, .ct-series.boss-health .ct-slice-pie {
  fill: #d70206;
}
.ct-legend .boss-health:before {
  background-color: #d70206;
  border-color: #d70206;
}
`}</style>
      </div>
    );
  }
}

export default Mana;
