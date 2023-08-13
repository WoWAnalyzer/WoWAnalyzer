import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { AutoSizer } from 'react-virtualized';
import { VisualizationSpec } from 'react-vega';

export interface UptimeHistoryEntry {
  timestamp: number;
  uptimePct: number;
}

interface GraphData {
  timestamp: number;
  activeTimePercentage: number;
}

const GRAPH_SAMPLE_COUNT = 2; // Show value for every Nth GCD in the graph.
const GRAPH_MAX_Y = 1; // The maximum value on the Y axis. Used to prevent the graph skyrocketing.

export default function getUptimeGraph(
  uptimeHistory: UptimeHistoryEntry[],
  fightStartTime: number,
) {
  const vegaSpec: VisualizationSpec = {
    data: {
      name: 'graphData',
    },
    transform: [
      {
        filter: 'isValid(datum.timestamp)',
      },
      {
        calculate: `datum.timestamp - ${fightStartTime}`,
        as: 'timestamp_shifted',
      },
      {
        // Tooltips cant have calculated fields, so we need to calculate this here.
        calculate: formatTime('datum.timestamp_shifted'),
        as: 'timestamp_humanized',
      },
    ],
    encoding: {
      x: {
        field: 'timestamp_shifted',
        type: 'quantitative' as const,
        axis: {
          labelExpr: formatTime('datum.value'),
          tickCount: 25,
          grid: false,
        },
        scale: {
          nice: false,
        },
        title: null,
      },
    },
    layer: [
      {
        layer: [
          // First layer always applies
          {
            mark: {
              type: 'line' as const,
              color: '#4caf50',
              interpolate: 'basis',
            },
          },
          // Makes a visual point if the "hover" signal defined further down is active for this point.
          { transform: [{ filter: { param: 'hover', empty: false } }], mark: 'point' },
        ],
        encoding: {
          y: {
            field: 'activeTimePercentage',
            type: 'quantitative' as const,
            axis: {
              grid: true,
              format: '.0%',
            },
          },
        },
      },
      {
        // Define one vertical line (type=rule) per datapoint that is white.
        mark: {
          type: 'rule',
          color: 'white',
        },
        encoding: {
          opacity: {
            // If the "hover" signal is active, make the line slightly opaque, else invisible.
            condition: {
              value: 0.3,
              param: 'hover',
              empty: false,
            },
            value: 0,
          },
          tooltip: [
            { field: 'timestamp_humanized', type: 'nominal', title: 'Time' },
            {
              field: 'activeTimePercentage',
              type: 'quantitative',
              title: 'Active time %',
              format: '.0%',
            },
          ],
        },
        // Activate the "hover" signal on the closest datapoint to the mouse cursor.
        params: [
          {
            name: 'hover',
            select: {
              type: 'point',
              fields: ['timestamp_shifted'],
              nearest: true,
              on: 'mouseover',
              clear: 'mouseout',
            },
          },
        ],
      },
    ],
    config: {
      view: {},
    },
  };

  const graphData: GraphData[] = [];
  uptimeHistory.forEach(({ timestamp, uptimePct }, i) => {
    // Don't need **every** GCD here.
    if (i % GRAPH_SAMPLE_COUNT === 0) {
      graphData.push({
        timestamp: timestamp,
        // Cap this, as it might aboslutely skyrocket during the first few seconds of the pull.
        activeTimePercentage: Math.min(uptimePct, GRAPH_MAX_Y),
      });
    }
  });

  return (
    <div
      className="graph-container"
      style={{
        width: '100%',
        minHeight: 200,
      }}
    >
      <AutoSizer>
        {({ width, height }) => (
          <BaseChart
            spec={vegaSpec}
            data={{ graphData: graphData }}
            width={width}
            height={height}
          />
        )}
      </AutoSizer>
    </div>
  );
}
