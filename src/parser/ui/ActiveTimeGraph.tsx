import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VisualizationSpec } from 'react-vega';
import { useMemo } from 'react';

/** The maximum value on the Y axis. Can't have active time higher than 100%. */
const GRAPH_MAX_Y = 1;
/** Minimum height of graph */
const GRAPH_HEIGHT = 160;
/** Sample period, in milliseconds */
const SAMPLE_PERIOD = 3000;
/** Duration of rolling average window, in milliseconds */
const ROLLING_AVERAGE_WINDOW_DURATION = 9000;

/** Data point effectively defines x (time) and y (active time percent) axes */
interface GraphData {
  timestamp: number;
  activeTimePercentage: number;
}

type Props = {
  activeTimeSegments: { start: number; end: number }[];
  fightStart: number;
  fightEnd: number;
};

const ActiveTimeGraph = ({ activeTimeSegments, fightStart, fightEnd, ...others }: Props) => {
  // Generate active time rolling average from active time segments (memoize for perf)
  const graphData = useMemo(() => {
    const graphData: GraphData[] = [];
    let currIdx = 0;
    for (
      let timestamp = fightStart + SAMPLE_PERIOD;
      timestamp < fightEnd;
      timestamp += SAMPLE_PERIOD
    ) {
      // advance segment index until we've passed window
      while (currIdx < activeTimeSegments.length && activeTimeSegments[currIdx].start < timestamp) {
        currIdx += 1;
      }
      const windowDuration = Math.min(ROLLING_AVERAGE_WINDOW_DURATION, timestamp - fightStart);
      const activeTimePercentage = getRollingAverage(
        activeTimeSegments,
        currIdx - 1,
        timestamp,
        windowDuration,
      );
      graphData.push({ timestamp, activeTimePercentage });
    }
    return graphData;
  }, [activeTimeSegments, fightStart, fightEnd]);

  return (
    <div
      className="graph-container"
      style={{
        width: '100%',
        minHeight: GRAPH_HEIGHT,
      }}
      {...others}
    >
      <AutoSizer>
        {({ width, height }) => (
          <BaseChart
            spec={generateVegaSpec(fightStart)}
            data={{ graphData }}
            width={width}
            height={height}
          />
        )}
      </AutoSizer>
    </div>
  );
};

export default ActiveTimeGraph;

/**
 * Helper for calculating the rolling average active time at a specific time.
 * @param activeTimeSegments all the active time segments
 * @param endIdx the latest index that could be in the window
 *   (we'll iterate backwards from here and stop when we leave the window, which should help perf and avoid n^2 time complexity)
 * @param timestamp timestamp for the rolling average. This will be the end of the window.
 * @param windowDuration the rolling average window duration, in milliseconds.
 */
function getRollingAverage(
  activeTimeSegments: { start: number; end: number }[],
  endIdx: number,
  timestamp: number,
  windowDuration: number,
) {
  const windowStart = timestamp - windowDuration;
  const windowEnd = timestamp;

  let activeInWindow = 0;
  for (let i = endIdx; i >= 0; i -= 1) {
    const segment = activeTimeSegments[i];
    if (segment.end <= windowStart) {
      break;
    }
    const overlapStart = Math.max(windowStart, segment.start);
    const overlapEnd = Math.min(windowEnd, segment.end);
    activeInWindow += Math.max(0, overlapEnd - overlapStart);
  }
  const rollingAvg = activeInWindow / windowDuration;
  return Math.min(rollingAvg, GRAPH_MAX_Y);
}

/**
 * Generates a Vega Spec for graphing active time over the encounter.
 */
function generateVegaSpec(fightStartTime: number): VisualizationSpec {
  return {
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
            title: 'Active Time',
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
              title: 'Active Time',
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
}
