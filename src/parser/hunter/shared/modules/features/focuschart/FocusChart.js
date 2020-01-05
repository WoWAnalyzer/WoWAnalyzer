import React from 'react';
import PropTypes from 'prop-types';
import { FlexibleWidthXYPlot as XYPlot, DiscreteColorLegend, XAxis, YAxis, VerticalGridLines, HorizontalGridLines, AreaSeries, LineSeries } from 'react-vis';
import { formatDuration } from 'common/format';
import './FocusChart.scss';
const COLORS = {
  FOCUS_FILL: 'rgba(0, 139, 215, 0.2)',
  FOCUS_BORDER: 'rgba(0, 145, 255, 1)',
  WASTED_FOCUS_FILL: 'rgba(255, 20, 147, 0.3)',
  WASTED_FOCUS_BORDER: 'rgba(255, 90, 160, 1)',
};

const FocusChart = props => {
  const { maxFocus, focus, wasted } = props;
  const xTicks = focus.filter(p => p.x % 30 === 0).map(p => p.x);
  const yTicks = [30, 60, 90, maxFocus];
  return (
    <XYPlot
      height={400}
      yDomain={[0, maxFocus]}
      margin={{
        top: 30,
      }}
    >
      <DiscreteColorLegend
        orientation="horizontal"
        strokeWidth={2}
        items={[
          { title: 'Focus', color: COLORS.FOCUS_BORDER },
          { title: 'Wasted Focus', color: COLORS.WASTED_FOCUS_BORDER },
        ]}
      />
      <XAxis title="Time" tickValues={xTicks} tickFormat={value => formatDuration(value)} />
      <YAxis title="Focus" tickValues={yTicks} />
      <VerticalGridLines
        tickValues={xTicks}
        style={{
          strokeDasharray: 3,
          stroke: 'white',
        }}
      />
      <HorizontalGridLines
        tickValues={yTicks}
        style={{
          strokeDasharray: 3,
          stroke: 'white',
        }}
      />
      <AreaSeries
        data={focus}
        color={COLORS.FOCUS_FILL}
        stroke="transparent"
        curve="curveMonotoneX"
      />
      <LineSeries
        data={focus}
        color={COLORS.FOCUS_BORDER}
        curve="curveMonotoneX"
      />
      <AreaSeries
        data={wasted}
        color={COLORS.WASTED_FOCUS_FILL}
        stroke="transparent"
        curve="curveMonotoneX"
      />
      <LineSeries
        data={wasted}
        color={COLORS.WASTED_FOCUS_BORDER}
        curve="curveMonotoneX"
      />
    </XYPlot>
  );
};

FocusChart.propTypes = {
  maxFocus: PropTypes.number.isRequired,
  focus: PropTypes.arrayOf(PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  })).isRequired,
  wasted: PropTypes.arrayOf(PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
  })).isRequired,
};

export default FocusChart;
