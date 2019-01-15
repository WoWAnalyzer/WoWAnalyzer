import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js';
import {Line} from 'react-chartjs-2';

import fetchWcl from 'common/fetchWclApi';

import ManaStyles from 'interface/others/ManaStyles.js';
import { FlexibleWidthXYPlot as XYPlot, DiscreteColorLegend, XAxis, YAxis, VerticalGridLines, HorizontalGridLines, AreaSeries, LineSeries } from 'react-vis/es';
import VerticalLine from 'interface/others/charts/VerticalLine';
import { formatDuration } from 'common/format';

import './ManaLevelGraph.scss';

class ManaChart extends React.PureComponent {
  static propTypes = {
    mana: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    })).isRequired,
    deaths: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
    })),
    bossData: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      borderColor: PropTypes.string.isRequired,
      backgroundColor: PropTypes.string.isRequired,
      data: PropTypes.arrayOf(PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
      })).isRequired,
    })).isRequired,
  };

  static defaultProps = {
    deaths: [],
  };

  colors = {
    mana: {
      border: 'rgba(2, 109, 215, 0.6)',
      background: 'rgba(2, 109, 215, 0.25)',
    },
    death: 'rgba(255, 0, 0, 0.8)',
  };

  fillMissingData(data) {
    // returns a copy of `data` where missing values are equal to the last known value
    // [0, null, 1, null, null, null, 3] => [0, 0, 1, 1, 1, 1, 3]
    const newData = [];
    let lastY = 0;
    data.forEach(({ x, y }) => {
      if (y !== null) {
        lastY = y;
      }
      newData.push({ x, y: lastY });
    });
    return newData;
  }

  render() {
    const { mana, deaths, bossData } = this.props;

    const xValues = [];
    const yValues = [0, 25, 50, 75, 100];
    const start = mana[0].x;
    const end = mana[mana.length - 1].x;
    for (let i = 0; i < (end - start); i += 30) {
      xValues.push(i);
    }

    const fixedMana = this.fillMissingData(mana);
    const fixedBossData = bossData.map(({ borderColor, backgroundColor, data }) => ({
      borderColor,
      backgroundColor,
      data: this.fillMissingData(data),
    }));

    return (
      <XYPlot
        height={400}
        yDomain={[0, 100]}
        margin={{
          top: 30,
        }}
      >
        <DiscreteColorLegend
          orientation="horizontal"
          items={[
            ...bossData.map(boss => ({ title: boss.title, color: boss.borderColor })),
            { title: 'Mana', color: this.colors.mana.border },
            { title: 'Deaths', color: this.colors.death },
          ]}
        />
        <XAxis tickValues={xValues} tickFormat={value => formatDuration(value)} />
        <YAxis tickValues={yValues} tickFormat={value => `${value}%`} />
        <VerticalGridLines
          tickValues={xValues}
          style={{
            strokeDasharray: 3,
            stroke: 'white',
            fill: 'white',
          }}
        />
        <HorizontalGridLines
          tickValues={yValues}
          style={{
            strokeDasharray: 3,
            stroke: 'white',
            fill: 'white',
          }}
        />
        {fixedBossData.map(boss => (
          <AreaSeries
            data={boss.data}
            color={boss.backgroundColor}
            stroke="transparent"
            curve="curveCardinal"
          />
        ))}
        {fixedBossData.map(boss => (
          <LineSeries
            data={boss.data}
            color={boss.borderColor}
            strokeWidth={2}
            curve="curveCardinal"
          />
        ))}
        <AreaSeries
          data={fixedMana}
          color={this.colors.mana.background}
          stroke="transparent"
          curve="curveMonotoneX"
        />
        <LineSeries
          data={fixedMana}
          color={this.colors.mana.border}
          strokeWidth={2}
          curve="curveMonotoneX"
        />
        {deaths.map(death => (
          <VerticalLine
            value={death.x}
            style={{
              line: { background: this.colors.death },
            }}
          />
        ))}
      </XYPlot>
    );
  }
}

class Mana extends React.PureComponent {
  static propTypes = {
    reportCode: PropTypes.string.isRequired,
    actorId: PropTypes.number.isRequired,
    start: PropTypes.number.isRequired,
    end: PropTypes.number.isRequired,
    manaUpdates: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);
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

  get plot() {
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
        if (death.targetID === this.props.actorId) {
          deathsBySecond[secIntoFight] = true;
        }
      });
    }

    const fightDurationSec = Math.ceil((end - start) / 1000);
    for (let i = 0; i <= fightDurationSec; i += 1) {

      manaBySecond[i] = manaBySecond[i] !== undefined ? manaBySecond[i] : null;
      bosses.forEach((series) => {
        series.data[i] = series.data[i] !== undefined ? series.data[i] : null;
      });
      deathsBySecond[i] = deathsBySecond[i] !== undefined ? deathsBySecond[i] : undefined;
    }

    const mana = Object.entries(manaBySecond)
      .filter(([key]) => Number(key) >= 0) // for unknown reason, there was a value at -1 second which messes up the chart
      .map(([key, value]) => ({ x: Number(key), y: value }));
    const deaths = Object.entries(deathsBySecond).filter(([key, value]) => !Number.isNaN(Number(key)) && value).map(([key]) => ({ x: Number(key) }));
    const bossData = bosses.map((series, index) => ({
      title: `${series.name} Health`,
      borderColor: ManaStyles[`Boss-${index}`].borderColor,
      backgroundColor: ManaStyles[`Boss-${index}`].backgroundColor,
      data: Object.entries(series.data).map(([key, value]) => ({ x: Number(key), y: value })),
    }));

    return (
      <ManaChart
        mana={mana}
        deaths={deaths}
        bossData={bossData}
      />
    );
  }

  render() {
    if (!this.state.bossHealth) {
      return (
        <div>
          Loading...
        </div>
      );
    }

    return (
      <div>
        Playing Arcane well typically involves managing your mana properly. Things such as not going OOM during Arcane Power, not letting your mana cap, and ensuring you end the fight with as little mana as possible will all help in improving your DPS.<br /><br />

        <div className="graph-container">
          {this.plot}
        </div>
      </div>
    );
  }
}

export default Mana;

