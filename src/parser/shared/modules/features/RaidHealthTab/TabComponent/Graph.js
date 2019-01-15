import React from 'react';
import PropTypes from 'prop-types';
import {
  FlexibleWidthXYPlot as XYPlot,
  DiscreteColorLegend,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  AreaSeries,
} from 'react-vis';

import fetchWcl from 'common/fetchWclApi';

import VerticalLine from 'interface/others/charts/VerticalLine';
import { formatDuration } from 'common/format';

import './RaidHealthChart.scss';

const DEATH_COLOR = 'rgba(255, 0, 0, 0.8)';
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

class RaidHealthChart extends React.Component {
  static propTypes = {
    players: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      borderColor: PropTypes.string.isRequired,
      backgroundColor: PropTypes.string.isRequired,
      data: PropTypes.arrayOf(PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
      })).isRequired,
    })).isRequired,
    deaths: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
    })).isRequired,
    startTime: PropTypes.number.isRequired,
    endTime: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      players: this.props.players.map(player => ({ disabled: false, ...player })),
    };
    this.togglePlayer = this.togglePlayer.bind(this);
  }

  state = {
    players: [],
  };

  togglePlayer(index) {
    this.setState((prevState) => {
      const players = prevState.players;
      players[index].disabled = !players[index].disabled;
      return {
        players,
      };
    });
  }

  render() {
    const { players, deaths, startTime, endTime } = this.props;

    const xValues = [];
    const yValues = [];
    for (let i = 0; i < (endTime - startTime) / 1000; i += 30) {
      xValues.push(i);
    }
    for (let i = 0; i <= players.length; i += 2) {
      yValues.push(i * 100);
    }

    // XYPlot injects ton of properties into its children, I want a plain div
    const LegendWrapper = (props) => (
      <div className="legend-wrapper horizontal">
        {props.children}
      </div>
    );

    return (
      <XYPlot
        height={500}
        yDomain={[0, players.length * 100]}
        margin={{
          left: 60,
          top: 70,
        }}
        stackBy="y"
      >
        <LegendWrapper>
          <DiscreteColorLegend
            orientation="horizontal"
            items={[
              ...this.state.players.map(player => ({
                title: player.title,
                color: player.borderColor,
                disabled: player.disabled,
              })),
              { title: 'Deaths', color: DEATH_COLOR },
            ]}
            onItemClick={(item, i) => {
              if (item.title === 'Deaths') {
                return;
              }
              this.togglePlayer(i);
            }}
          />
        </LegendWrapper>
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
        {this.state.players.filter(player => !player.disabled).map(player => (
          <AreaSeries
            data={player.data}
            color={player.backgroundColor}
            stroke="transparent"
            stack
          />
        ))}
        {deaths.map(({ x }) => (
          <VerticalLine
            value={x}
            style={{
              line: { background: DEATH_COLOR },
            }}
          />
        ))}
      </XYPlot>
    );
  }
}

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

  get plot() {
    const { start, end } = this.props;
    const data = this.state.data;

    const players = data.series.filter(item => !!CLASS_CHART_LINE_COLORS[item.type]);

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
    for (let i = 0; i <= fightDurationSec; i += 1) {
      entities.forEach((series) => {
        series.data[i] = series.data[i] !== undefined ? series.data[i] : series.lastValue;
        series.lastValue = series.data[i];
      });
      deathsBySecond[i] = deathsBySecond[i] !== undefined ? deathsBySecond[i] : undefined;
    }

    // transform data into react-vis format
    const playerHealth = entities.map(player => {
      const data = Object.entries(player.data).map(([key, value]) => ({ x: Number(key), y: value }));
      return {
        title: player.name,
        backgroundColor: CLASS_CHART_LINE_COLORS[player.type],
        borderColor: CLASS_CHART_LINE_COLORS[player.type],
        data,
      };
    });
    const deaths = Object.entries(deathsBySecond).filter(([_, value]) => !!value).map(([key]) => ({ x: Number(key) }));

    return (
      <RaidHealthChart
        players={playerHealth}
        deaths={deaths}
        startTime={start}
        endTime={end}
      />
    );
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

    return (
      <div className="graph-container">
        {this.plot}
      </div>
    );
  }
}

export default Graph;

