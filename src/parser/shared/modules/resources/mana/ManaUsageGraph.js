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

import { formatDuration, formatThousands } from 'common/format';

import './ManaUsageGraph.scss';

const COLORS = {
  MANA: {
    background: 'rgba(2, 109, 215, 0.25)',
    border: 'rgba(2, 109, 215, 0.6)',
  },
  HEALING: {
    background: 'rgba(2, 217, 110, 0.2)',
    border: 'rgba(2, 217, 110, 0.6)',
  },
  MANA_USED: {
    background: 'rgba(215, 2, 6, 0.4)',
    border: 'rgba(215, 2, 6, 0.6)',
  },
};

class ManaUsageGraph extends React.Component {
  static propTypes = {
    mana: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    })).isRequired,
    healing: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    })).isRequired,
    manaUsed: PropTypes.arrayOf(PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    })).isRequired,
  };

  get yAxisMarks() {
    const { mana, healing, manaUsed } = this.props;
    let Y_TICK_PERIOD = 5000;
    let max = 0;
    // they should all have the same amount of items
    for (let i = 0; i < mana.length; i++) {
      if (mana[i].y > max) {
        max = mana[i].y;
      }
      if (healing[i].y > max) {
        max = healing[i].y;
      }
      if (manaUsed[i].y > max) {
        max = manaUsed[i].y;
      }
    }
    // we choose either 5000 or 10000 step, depending on the max value
    // if 5000 step would produce too many ticks (I'd say 10 ticks including 0 is the max), use 10000 step
    if (Math.floor(max / Y_TICK_PERIOD) + 2 > 10) {
      // + 1 because we want the nearesst tick AFTER the max too, + 1 because for loop is <= maxI
      Y_TICK_PERIOD = 10000;
    }
    const maxI = Math.floor(max / Y_TICK_PERIOD) + 1; // +1 because we want the nearest tick after max too
    const values = [];
    for (let i = 0; i <= maxI; i += 1) {
      values.push(i * Y_TICK_PERIOD);
    }
    return values;
  }

  render() {
    const { mana, healing, manaUsed } = this.props;

    const yTicks = this.yAxisMarks;
    const xTicks = [];
    const duration = mana[mana.length - 1].x - 0;
    const steps = 20;
    const optimalInterval = 30; // seconds
    const interval = Math.max(optimalInterval, Math.floor(duration / steps / optimalInterval) * optimalInterval);
    for (let i = 0; i < mana[mana.length - 1].x; i += interval) {
      xTicks.push(i);
    }

    return (
      <XYPlot
        height={400}
        yDomain={[0, yTicks[yTicks.length - 1]]}
        margin={{
          left: 60,
          top: 30,
        }}
      >
        <DiscreteColorLegend
          orientation="horizontal"
          strokeWidth={2}
          items={[
            { title: 'Mana', color: COLORS.MANA.border },
            { title: 'HPS', color: COLORS.HEALING.border },
            { title: 'Mana Used', color: COLORS.MANA_USED.border },
          ]}
        />
        <XAxis tickValues={xTicks} tickFormat={value => formatDuration(value)} />
        <YAxis tickValues={yTicks} tickFormat={value => formatThousands(value)} />
        <VerticalGridLines
          tickValues={xTicks}
          style={{
            strokeDasharray: [2, 2],
          }}
        />
        <HorizontalGridLines
          tickValues={yTicks}
          style={{
            strokeDasharray: [2, 2],
          }}
        />
        <AreaSeries
          data={mana}
          color={COLORS.MANA.background}
          stroke="transparent"
          curve="curveMonotoneX"
        />
        <LineSeries
          data={mana}
          color={COLORS.MANA.border}
          strokeWidth={2}
          curve="curveMonotoneX"
        />
        <AreaSeries
          data={healing}
          color={COLORS.HEALING.background}
          stroke="transparent"
          curve="curveMonotoneX"
        />
        <LineSeries
          data={healing}
          color={COLORS.HEALING.border}
          strokeWidth={2}
          curve="curveMonotoneX"
        />
        <AreaSeries
          data={manaUsed}
          color={COLORS.MANA_USED.background}
          stroke="transparent"
          curve="curveMonotoneX"
        />
        <LineSeries
          data={manaUsed}
          color={COLORS.MANA_USED.border}
          strokeWidth={2}
          curve="curveMonotoneX"
        />
      </XYPlot>
    );
  }
}

export default ManaUsageGraph;
