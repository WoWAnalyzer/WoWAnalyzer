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

import {formatDuration} from 'common/format';

import './PainChart.scss';

class PainChart extends React.PureComponent {
  static propTypes = {
    pain: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    })).isRequired,
    wasted: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    })).isRequired,
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

  colors = {
    pain: {
      border: 'rgba(0, 143, 255, 0.6)',
      background: 'rgba(0, 143, 255, 0.08)',
    },
    wasted: {
      border: 'rgba(255, 109, 215, 0.6)',
      background: 'rgba(255, 45, 215, 0.2)',
    },
  };

  render() {
    const { pain, wasted, bossData, startTime, endTime } = this.props;

    const xValues = [];
    const yValues = [0, 25, 50, 75, 100];
    for (let i = startTime; i < endTime; i += 60*1000) {
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
            { title: 'Pain', color: this.colors.pain.border },
            { title: 'Pain wasted', color: this.colors.wasted.border },
          ]}
        />
        <XAxis tickValues={xValues} tickFormat={value => formatDuration((value - startTime) / 1000)} />
        <YAxis tickValues={yValues} />
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
          />
        ))}
        {bossData.map(boss => (
          <LineSeries
            data={boss.data}
            color={boss.borderColor}
            strokeWidth={2}
          />
        ))}
        <AreaSeries
          data={pain}
          color={this.colors.pain.background}
          stroke="transparent"
        />
        <LineSeries
          data={pain}
          color={this.colors.pain.border}
          strokeWidth={2}
        />
        <AreaSeries
          data={wasted}
          color={this.colors.wasted.background}
          stroke="transparent"
        />
        <LineSeries
          data={wasted}
          color={this.colors.wasted.border}
          strokeWidth={2}
        />
      </XYPlot>
    );
  }
}

export default PainChart;
