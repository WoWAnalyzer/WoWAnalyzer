import React from 'react';
import PropTypes from 'prop-types';
import Chart from 'chart.js';
import {Line} from 'react-chartjs-2';

import fetchWcl from 'common/fetchWclApi';

import ManaStyles from 'interface/others/ManaStyles.js';
import { FlexibleWidthXYPlot as XYPlot, DiscreteColorLegend, XAxis, YAxis, VerticalGridLines, HorizontalGridLines, AreaSeries, LineSeries } from 'react-vis/es';
import VerticalLine from 'interface/others/charts/VerticalLine';
import { formatDuration, formatNumber, formatThousands } from 'common/format';

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
    startTime: PropTypes.number.isRequired,
    endTime: PropTypes.number.isRequired,
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

  render() {
    const { mana, deaths, bossData, startTime, endTime } = this.props;

    const xValues = [];
    const yValues = [0, 25, 50, 75, 100];
    for (let i = startTime; i < endTime; i += 30*1000) {
      xValues.push(i);
    }

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
        <XAxis tickValues={xValues} tickFormat={value => formatDuration((value - startTime) / 1000)} />
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
        {bossData.map(boss => (
          <AreaSeries
            data={boss.data}
            color={boss.backgroundColor}
            stroke="transparent"
            curve="curveCardinal"
          />
        ))}
        {bossData.map(boss => (
          <LineSeries
            data={boss.data}
            color={boss.borderColor}
            strokeWidth={2}
            curve="curveCardinal"
          />
        ))}
        <AreaSeries
          data={mana}
          color={this.colors.mana.background}
          stroke="transparent"
          curve="curveMonotoneX"
        />
        <LineSeries
          data={mana}
          color={this.colors.mana.border}
          strokeWidth={2}
          curve="curveMonotoneX"
        />
        {deaths.map(({ x }) => (
          <VerticalLine
            value={x}
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

    const mana = manaUpdates.map(({ timestamp, current, max }) => {
      const x = Math.max(timestamp, start);
      return {
        x,
        y: (current / max) * 100,
      };
    });

    let deaths = null;
    if (this.state.bossHealth.deaths) {
      deaths = this.state.bossHealth.deaths
        .filter(death => death.targetID === this.props.actorId)
        .map(({ timestamp }) => ({ x: timestamp }));
    }

    const bossData = this.state.bossHealth.series.map((series, i) => {
      const data = series.data.map(([timestamp, health]) => ({ x: timestamp, y: health }));
      return {
        title: `${series.name} Health`,
        borderColor: ManaStyles[`Boss-${i}`].borderColor,
        backgroundColor: ManaStyles[`Boss-${i}`].backgroundColor,
        data,
      };
    });

    return (
      <ManaChart
        mana={mana}
        deaths={deaths}
        bossData={bossData}
        startTime={start}
        endTime={end}
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

