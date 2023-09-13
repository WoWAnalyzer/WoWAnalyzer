// DisintegratePlot.tsx
import React from 'react';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import { AutoSizer } from 'react-virtualized';
import { UnitSpec } from 'vega-lite/build/src/spec';
import { Field } from 'vega-lite/build/src/channeldef';

/**
 * Represents the configuration options for the individual graphs that
 * should be rendered.
 */
export type GraphData = {
  graphData: DataSeries[];
  /** Optional title, used for multigraph rendering */
  title?: string;
  /** timestamp to start rendering the graph at */
  startTime?: number;
  /** timestamp to end rendering the graph at */
  endTime?: number;
};

/**
 * Represents a series of data points for the graph, including information
 * about individual SpellTrackers, their visualization type (point, line, area),
 * and color.
 * This is the data we hand to Vega for graphing.
 */
export type DataSeries = {
  spellTracker: SpellTracker[];
  /** The type of data this is */
  type: 'point' | 'line' | 'area';
  color: string;
};

/**
 * Represents a data point for tracking spells, including timestamp, count,
 * and an optional tooltip.
 */
export type SpellTracker = {
  /** Timestamp the event occured */
  timestamp: number;
  /** y-axis value */
  count: number;
  /** Optional tooltip, used for points */
  tooltip?: string;
};

type Props = {
  fightStartTime: number;
  fightEndTime: number;
  graphData?: GraphData[];
  multiGraph?: boolean;
};

const DisintegratePlot: React.FC<Props> = ({ fightStartTime, fightEndTime, graphData }) => {
  const colorData = {
    dragonrageBuffCounter: '#CCCCCC',
    disintegrateCasts: '#2ecc71',
    disintegrateChainCasts: 'orange',
    disintegrateClips: '#9b59b6',
    problemPoints: 'red',
  };

  /** We want high fidelity for ticks so it's easier to look up specific timings on logs/vods */
  const tickCount = (fightEndTime - fightStartTime) / 1000;
  const xAxis = {
    field: 'timestamp_shifted',
    type: 'quantitative' as const,
    axis: {
      labelExpr: formatTime('datum.value'),
      tickCount: tickCount,
      grid: false,
      labelAngle: 30,
    },
    scale: {
      zero: false,
      nice: false,
    },
    title: 'Time',
  };

  const yAxis = {
    field: 'count',
    type: 'quantitative' as const,
    axis: {
      gridOpacity: 0.3,
      format: '~s',
      title: 'Ticks',
    },
  };

  const line = (dataName: string): UnitSpec<Field> => ({
    data: { name: dataName },
    mark: {
      type: 'line',
      interpolate: 'step-after',
      size: 3,
    },
    transform: [
      { filter: 'isValid(datum.count)' },
      {
        calculate: `datum.timestamp - ${fightStartTime}`,
        as: 'timestamp_shifted',
      },
    ],
    encoding: {
      color: {
        type: 'nominal',
      },
    },
  });

  const area = (dataName: string, color: string): UnitSpec<Field> => ({
    data: { name: dataName },
    mark: {
      type: 'area',
      interpolate: 'step-after',
      line: {
        strokeWidth: 0.5,
      },
      opacity: 0.2,
    },
    transform: [
      {
        calculate: `datum.timestamp - ${fightStartTime}`,
        as: 'timestamp_shifted',
      },
    ],
    encoding: {
      color: { value: color },
    },
  });

  const point = (dataName: string, color: string, tooltipFieldName: string): UnitSpec<Field> => ({
    data: { name: dataName },
    mark: {
      type: 'point' as const,
      shape: 'circle',
      filled: true,
      size: 120,
      opacity: 1,
    },
    encoding: {
      tooltip: { field: tooltipFieldName, type: 'nominal' },
      color: { value: color },
    },
    transform: [
      {
        calculate: `datum.timestamp - ${fightStartTime}`,
        as: 'timestamp_shifted',
      },
    ],
  });
  const spec: VisualizationSpec = {
    encoding: {
      x: xAxis,
      y: yAxis,
    },

    layer: [
      {
        ...area('dragonrageBuffCounter', colorData.dragonrageBuffCounter),
      },
      {
        ...line('disintegrateTicksCounter'),
      },
      {
        ...point('disintegrateCasts', colorData.disintegrateCasts, 'tooltip'),
      },
      {
        ...point('disintegrateChainCasts', colorData.disintegrateChainCasts, 'tooltip'),
      },
      {
        ...point('problemPoints', colorData.problemPoints, 'tooltip'),
      },
      {
        ...point('disintegrateClips', colorData.disintegrateClips, 'tooltip'),
      },
    ],
  };

  // If the x-axis is too long, we enable horizontal scrolling, for better readability
  const graphLength = fightEndTime - fightStartTime;
  const threshold = 0.6 * 60 * 1000;

  // Calculate the width percentage so the graph has consistent size
  const widthPercentage = graphLength > threshold ? (graphLength / threshold) * 100 : 100;

  return (
    <div
      className="graph-container"
      style={{
        width: '100%',
        overflowX: graphLength > threshold ? 'auto' : 'hidden', // Enable horizontal scrolling if the data length exceeds the threshold
      }}
    >
      <div
        style={{
          padding: graphLength > threshold ? '0 0 30px' : '0 0 0px', // Add padding so scrollbar doesn't overlap x-axis
          width: `${widthPercentage}%`,
          overflowY: 'hidden',
          minHeight: 250,
        }}
      >
        <AutoSizer>
          {({ width, height }) => <BaseChart spec={spec} data={{}} width={width} height={height} />}
        </AutoSizer>
      </div>
    </div>
  );
};

export default DisintegratePlot;
