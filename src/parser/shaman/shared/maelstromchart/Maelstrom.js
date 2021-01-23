//Based on Main/Mana.js and parser/VengeanceDemonHunter/Modules/PainChart
//Note: For those that might wish to add Boss Health in the future- some of the work is already done here: https://github.com/leapis/WoWAnalyzer/tree/focusChartBossHealth

import React from 'react';
import PropTypes from 'prop-types';
import { AutoSizer } from 'react-virtualized';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';

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

  const { start } = props;

  const rawData = [];

  props.tracker.resourceUpdates.forEach((item) => {
    const secIntoFight = Math.floor((item.timestamp - start) / 1000);
    rawData.push({kind: 'Maelstrom', x: secIntoFight, y:item.current});
    rawData.push({kind: 'Wasted', x: secIntoFight, y:item.waste});
  });

  const data = {
    data: rawData,
  };

  const spec = {
    mark: {
      type: 'area',
      line: {
        strokeWidth: 1,
      },
    },
    encoding: {
      x: {
        field: 'x',
        type: 'quantitative',
        axis: {
          labelExpr: formatTime('datum.value * 1000'),
          grid: false,
        },
        scale: {
          nice: false,
        },
        title: 'Time',
      },
      y: {
        field: 'y',
        type: 'quantitative',
        axis: {
          grid: false,
        },
        title: 'Maelstrom',
      },
      color: {
        field: 'kind',
        type: 'nominal',
        title: null,
        legend: {
          orient: 'top',
        },
        scale: {
          domain: ['Maelstrom', 'Wasted'],
          range: [COLORS.MAELSTROM_FILL, COLORS.WASTED_MAELSTROM_FILL],
        },
      },
      stroke: {
        field: 'kind',
        type: 'nominal',
        title: null,
        legend: {
          orient: 'top',
        },
        scale: {
          domain: ['Maelstrom', 'Wasted'],
          range: [COLORS.MAELSTROM_BORDER, COLORS.WASTED_MAELSTROM_BORDER],
        },
      },
    },
    data: {
      name: 'data',
    },
  };

 return (
   <AutoSizer disableHeight>
     {({ width }) => (
       <BaseChart
         height={400}
         width={width}
         spec={spec}
         data={data}
       />
     )}
   </AutoSizer>
 );
};

Maelstrom.propTypes = {
  start: PropTypes.number.isRequired,
  tracker: PropTypes.object,
};

export default Maelstrom;
