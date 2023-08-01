// BreathOfEonsPlot.tsx
import React from 'react';
import { BreathOfEonsWindows, GRAPHBUFFER, SpellTracker } from './BreathOfEonsRotational'; // Import any required types
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import { AutoSizer } from 'react-virtualized';
import { UnitSpec } from 'vega-lite/build/src/spec';
import { Field } from 'vega-lite/build/src/channeldef';

type Props = {
  window: BreathOfEonsWindows;
  fightStartTime: number;
  fightEndTime: number;
  ebonMightCount: SpellTracker[];
  shiftingSandsCount: SpellTracker[];
};

const BreathOfEonsPlot: React.FC<Props> = ({
  window,
  fightStartTime,
  fightEndTime,
  ebonMightCount,
  shiftingSandsCount,
}) => {
  const startTime = window.start - GRAPHBUFFER;
  let endTime = window.end + GRAPHBUFFER;
  if (endTime > fightEndTime) {
    endTime = fightEndTime;
  }

  /** This is used to filter through event counters to make new ones
   * that are limited to within the timeframe of our current breath windows.
   * essentially helps create concentrated Breath window graphs */
  const filterItems = (items: SpellTracker[]): SpellTracker[] => {
    let filteredItems: SpellTracker[] = [];
    let prevCount = 0;
    let endFound = false;

    for (let i = 0; i < items.length; i += 1) {
      const entry = items[i];
      const timestamp = entry.timestamp;
      const count = entry.count;

      if (timestamp < startTime) {
        filteredItems = [{ timestamp: startTime, count: count }];
        prevCount = count;
      }

      if (timestamp >= startTime && timestamp <= endTime) {
        if (filteredItems.length === 0) {
          filteredItems = [{ timestamp: startTime, count: 0 }];
        }
        prevCount = count;
        filteredItems.push({ timestamp: timestamp, count: count });
      } else if (timestamp > endTime) {
        filteredItems.push({ timestamp: endTime, count: prevCount });
        endFound = true;
        break;
      }
    }
    if (!endFound) {
      filteredItems.push({ timestamp: endTime, count: prevCount });
    }
    return filteredItems;
  };

  const filteredEbonCount = filterItems(ebonMightCount);
  const filteredShiftingSandsCount = filterItems(shiftingSandsCount);

  const xAxis = {
    field: 'timestamp_shifted',
    type: 'quantitative' as const,
    axis: {
      labelExpr: formatTime('datum.value'),
      tickCount: 10,
      grid: false,
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
      title: null,
    },
  };

  const line = (dataName: string, label: string): UnitSpec<Field> => ({
    data: { name: dataName },
    mark: {
      type: 'line',
      interpolate: 'step-after',
      size: 4,
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
        datum: label,
        type: 'nominal',
      },
    },
  });

  const area = (dataName: string, label: string): UnitSpec<Field> => ({
    data: { name: dataName },
    mark: {
      type: 'area',
      interpolate: 'step-after',
      line: {
        strokeWidth: 3,
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
      color: {
        datum: label,
        type: 'nominal',
      },
    },
  });

  const point = (dataName: string, label: string, tooltip: string | null): UnitSpec<Field> => ({
    data: { name: dataName },
    mark: {
      type: 'point' as const,
      shape: 'circle',
      filled: true,
      size: 120,
      opacity: 1,
    },
    encoding: {
      tooltip: {
        value: tooltip,
      },
      color: {
        datum: label,
        type: 'nominal',
      },
    },
    transform: [
      {
        calculate: `datum.timestamp - ${fightStartTime}`,
        as: 'timestamp_shifted',
      },
    ],
  });

  const colorRange = [
    '#736F4E', // Temporal Wounds
    '#F3A738', // Ebon Might
    '#F7EC59', // Shifting Sands
    '#FF6B6B', // Flight Time
    'red', // Problem Points
  ];
  const spec: VisualizationSpec = {
    encoding: {
      x: xAxis,
      y: yAxis,
      color: {
        // Color range to make legend behave. Order is
        scale: { range: colorRange },
        legend: {
          symbolOpacity: 1,
        },
      },
    },

    layer: [
      // Temporal Wounds
      {
        ...area('breathCount', 'Temporal Wounds'),
      },
      // Ebon Might
      {
        ...line('ebonCount', 'Ebon Might'),
      },
      // Shifting Sands
      {
        ...line('shiftingSandsCount', 'Shifting Sands'),
      },
      // Flight Time
      {
        ...area('flightData', 'Flight Time'),
      },
      // Damage Problem Points
      {
        ...point(
          'damageProblemPoints',
          'Problem Point',
          'A mob died before Breath went off, losing you potential damage.',
        ),
      },
      // Ebon Might Problem Points
      {
        ...point(
          'ebonMightProblemPoints',
          'Problem Point',
          'You dropped Ebon Might here, this is a major DPS loss!',
        ),
      },
    ],
  };

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
            spec={spec}
            data={{
              breathCount: window.breathPerformance.temporalWoundsCounter,
              ebonCount: filteredEbonCount,
              damageProblemPoints: window.breathPerformance.damageProblemPoints,
              ebonMightProblemPoints: window.breathPerformance.ebonMightProblems,
              flightData: window.flightData,
              shiftingSandsCount: filteredShiftingSandsCount,
            }}
            width={width}
            height={height}
          />
        )}
      </AutoSizer>
    </div>
  );
};

export default BreathOfEonsPlot;
