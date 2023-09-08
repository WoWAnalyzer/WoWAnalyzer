// DisintegratePlot.tsx
import React from 'react';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import { AutoSizer } from 'react-virtualized';
import { UnitSpec } from 'vega-lite/build/src/spec';
import { Field } from 'vega-lite/build/src/channeldef';
import { SpellTracker } from './Disintegrate';

type Props = {
  fightStartTime: number;
  fightEndTime: number;
  spellTrackers: SpellTracker[][];
};

const DisintegratePlot: React.FC<Props> = ({ fightStartTime, fightEndTime, spellTrackers }) => {
  const colorData = {
    dragonrageBuffCounter: '#CCCCCC',
    disintegrateCasts: '#2ecc71',
    disintegrateChainCasts: 'orange',
    disintegrateClips: '#9b59b6',
    problemPoints: 'red',
  };

  /** We want high fidelity for ticks so it's easier to look up specfic timings on logs/vods */
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

  const disintegrateTicksCounter = spellTrackers[0];
  const disintegrateCasts = spellTrackers[1];
  const disintegrateChainCasts = spellTrackers[2];
  const problemPoints = spellTrackers[3];
  const dragonrageBuffCounter = spellTrackers[4];
  const disintegrateClips = spellTrackers[5];

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
          {({ width, height }) => (
            <BaseChart
              spec={spec}
              data={{
                disintegrateTicksCounter: disintegrateTicksCounter,
                disintegrateCasts: disintegrateCasts,
                disintegrateChainCasts: disintegrateChainCasts,
                problemPoints: problemPoints,
                dragonrageBuffCounter: dragonrageBuffCounter,
                disintegrateClips: disintegrateClips,
              }}
              width={width}
              height={height}
            />
          )}
        </AutoSizer>
      </div>
    </div>
  );
};

export default DisintegratePlot;
