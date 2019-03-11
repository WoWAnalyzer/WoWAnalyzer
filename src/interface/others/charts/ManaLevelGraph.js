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
  LineSeries,
} from 'react-vis';

import { formatDuration } from 'common/format';

import VerticalLine from './VerticalLine';
import './ManaLevelGraph.scss';

class ManaLevelGraph extends React.PureComponent {
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
            key={boss.id}
            data={boss.data}
            color={boss.backgroundColor}
            stroke="transparent"
          />
        ))}
        {bossData.map(boss => (
          <LineSeries
            key={boss.id}
            data={boss.data}
            color={boss.borderColor}
            strokeWidth={2}
          />
        ))}
        <AreaSeries
          data={mana}
          color={this.colors.mana.background}
          stroke="transparent"
        />
        <LineSeries
          data={mana}
          color={this.colors.mana.border}
          strokeWidth={2}
        />
        {deaths.map(({ x }, index) => (
          <VerticalLine
            key={index}
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
export default ManaLevelGraph;
