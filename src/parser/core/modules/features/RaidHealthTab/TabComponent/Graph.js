import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js';
import { Line } from 'react-chartjs-2';

import fetchWcl from 'common/fetchWclApi';

import ManaStyles from 'interface/others/ManaStyles.js';

const formatDuration = (duration) => {
  const seconds = Math.floor(duration % 60);
  return `${Math.floor(duration / 60)}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

const CLASS_CHART_LINE_COLORS = {
  DeathKnight: 'rgba(196, 31, 59, 0.6)',
  Druid: 'rgba(255, 125, 10, 0.6)',
  Hunter: 'rgba(171, 212, 115, 0.6)',
  Mage: 'rgba(105, 204, 240, 0.6)',
  Monk: 'rgba(45, 155, 120, 0.6)',
  Paladin: 'rgba(245, 140, 186, 0.6)',
  Priest: 'rgba(255, 255, 255, 0.6)',
  Rogue: 'rgba(255, 245, 105, 0.6)',
  Shaman: 'rgba(36, 89, 255, 0.6)',
  Warlock: 'rgba(148, 130, 201, 0.6)',
  Warrior: 'rgba(199, 156, 110, 0.6)',
  DemonHunter: 'rgba(163, 48, 201, 0.6)',
};

class Graph extends React.PureComponent {
  static propTypes = {
    reportCode: PropTypes.string.isRequired,
    actorId: PropTypes.number.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
  };

  constructor() {
    super();
    this.state = {
      data: null,
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
      abilityid: 1000,
    })
      .then(json => {
        console.log('Received player health', json);
        this.setState({
          data: json,
        });
      });
  }

  render() {
    const data = this.state.data;
    if (!data) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    const { start, end } = this.props;

    const series = data.series;
    const players = series.filter(item => !!CLASS_CHART_LINE_COLORS[item.type]);

    const entities = [];

    players.forEach(series => {
      const newSeries = {
        ...series,
        lastValue: 100, // fights start at full hp
        data: {},
      };

      series.data.forEach((item) => {
        const secIntoFight = Math.floor((item[0] - start) / 1000);

        const health = item[1];
        newSeries.data[secIntoFight] = Math.min(100, health);
      });
      entities.push(newSeries);
    });

    const deathsBySecond = {};
    if (this.state.data.deaths) {
      this.state.data.deaths.forEach((death) => {
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

      entities.forEach((series) => {
        series.data[i] = series.data[i] !== undefined ? series.data[i] : series.lastValue;
        series.lastValue = series.data[i];
      });
      deathsBySecond[i] = deathsBySecond[i] !== undefined ? deathsBySecond[i] : undefined;
    }

    const chartData = {
      labels,
      datasets: [
        ...entities.map((series, index) => ({
          label: series.name,
          ...ManaStyles['Boss-0'],
          backgroundColor: CLASS_CHART_LINE_COLORS[series.type],
          borderColor: CLASS_CHART_LINE_COLORS[series.type],
          data: Object.keys(series.data).map(key => series.data[key]),
        })),
        {
          label: `Deaths`,
          ...ManaStyles.Deaths,
          data: Object.keys(deathsBySecond).map(key => deathsBySecond[key]),
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
            max: players.length * 100,
            fontSize: 14,
          },
          stacked: true,
        }],
        xAxes: [{
          gridLines: gridLines,
          ticks: {
            callback: (value, index, values) => {
              if (value % 30 === 0) {
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
      afterDatasetsDraw: (chart) => {
        const ctx = chart.ctx;

        chart.data.datasets.forEach(function (dataset, i) {
          const meta = chart.getDatasetMeta(i);
          if (dataset.label === 'Deaths' && !meta.hidden) {
            meta.data.forEach(function (element, index) {
              const position = element.tooltipPosition();
              if (!isNaN(position.y)) {
                ctx.strokeStyle = element._view.borderColor;
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
      <div className="graph-container">
        <Line
          data={chartData}
          options={options}
          width={1100}
          height={400}
        />
      </div>
    );
  }
}

export default Graph;

