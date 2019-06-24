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
import { formatDuration } from 'common/format';
import VerticalLine from 'interface/others/charts/VerticalLine';

import './RaidHealthChart.scss';

const DEATH_COLOR = 'rgba(255, 0, 0, 0.8)';

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
    offsetTime: PropTypes.number.isRequired,
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
    const { players, deaths, startTime, endTime, offsetTime } = this.props;
    console.log(startTime, endTime, offsetTime);
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
        <XAxis tickValues={xValues} tickFormat={value => formatDuration(value + offsetTime/1000)} />
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

export default RaidHealthChart;
