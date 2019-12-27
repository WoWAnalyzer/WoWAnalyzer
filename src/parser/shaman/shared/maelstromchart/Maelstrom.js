//Based on Main/Mana.js and parser/VengeanceDemonHunter/Modules/PainChart
//Note: For those that might wish to add Boss Health in the future- some of the work is already done here: https://github.com/leapis/WoWAnalyzer/tree/focusChartBossHealth

import React from 'react';
import PropTypes from 'prop-types';

import { formatDuration } from 'common/format';
import {
  DiscreteColorLegend,
  XAxis,
  YAxis,
  VerticalGridLines,
  HorizontalGridLines,
  AreaSeries,
  LineSeries,
  FlexibleWidthXYPlot as XYPlot,
} from 'react-vis';

const COLORS = {
  MAELSTROM_FILL: 'rgba(0, 139, 215, 0.2)',
  MAELSTROM_BORDER: 'rgba(0, 145, 255, 1)',
  WASTED_MAELSTROM_FILL: 'rgba(255, 20, 147, 0.3)',
  WASTED_MAELSTROM_BORDER: 'rgba(255, 90, 160, 1)',
};

const Maelstrom = props => {
  if (!props.tracker) {
    return (
      <div>
        Loading...
      </div>
    );
  }

  const maxResource = props.tracker.maxResource || props.max;
  const { start } = props;

  const resource = [];
  const waste = [];


  props.tracker.resourceUpdates.forEach((item) => {
    const secIntoFight = Math.floor((item.timestamp - start) / 1000);
    resource.push({x: secIntoFight, y:item.current});
    waste.push({x: secIntoFight, y:item.waste});
  });

 return (
    <div>
      <XYPlot
        height={400}
        yDomain={[0, maxResource]}
        margin={{
          top: 30,
        }}
      >
        <DiscreteColorLegend
          orientation="horizontal"
          strokeWidth={2}
          items={[
            { title: 'Maelstrom', color: COLORS.MAELSTROM_BORDER },
            { title: 'Wasted Maelstrom', color: COLORS.WASTED_MAELSTROM_BORDER },
          ]}
          style={{
            position: 'absolute',
            top: '-15px',
            left: '40%',
          }}
        />
        <XAxis title="Time" tickFormat={value => formatDuration(value)} />
        <YAxis title="Maelstrom" />
        <VerticalGridLines
          tickValues={resource.filter(p => p.x % 30 === 0).map(p => p.x)}
          style={{
            strokeDasharray: 3,
            stroke: 'white',
          }}
        />
        <HorizontalGridLines
          tickValues={[30, 60, 90, maxResource]}
          style={{
            strokeDasharray: 3,
            stroke: 'white',
          }}
        />
        <AreaSeries
          data={resource}
          color={COLORS.MAELSTROM_FILL}
          stroke="transparent"
        />
        <LineSeries
          data={resource}
          color={COLORS.MAELSTROM_BORDER}
        />
        <AreaSeries
          data={waste}
          color={COLORS.WASTED_MAELSTROM_FILL}
          stroke="transparent"
        />
        <LineSeries
          data={waste}
          color={COLORS.WASTED_MAELSTROM_BORDER}
        />
      </XYPlot>
    </div>
  );
};

Maelstrom.propTypes = {
  start: PropTypes.number.isRequired,
  max: PropTypes.number,
  tracker: PropTypes.object,
};

export default Maelstrom;
