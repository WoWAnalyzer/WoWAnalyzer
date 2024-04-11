import React, { useState } from 'react';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';
import { UnitSpec } from 'vega-lite/build/src/spec';
import { Field } from 'vega-lite/build/src/channeldef';
import { InlineData } from 'vega-lite/build/src/data';
import { LayerSpec } from 'vega-lite/build/src/spec';
import './Styling.scss';

/**
 * Represents the configuration options for the individual graphs that
 * should be rendered.
 */
export type GraphData = {
  graphData: DataSeries[];
  /** timestamp to start rendering the graph at */
  startTime: number;
  /** timestamp to end rendering the graph at */
  endTime: number;
  /** Optional title, used for multigraph rendering.
   * Will not render on single graphs*/
  title?: string;
  error?: JSX.Element;
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
  type: 'area' | 'line' | 'point';
  color: string;
  /** Legend */
  label: string;
  strokeWidth?: number;
  size?: number;
  hideTooltip?: boolean;
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
  graphData: GraphData[];
  yAxisName: string;
  explanations?: JSX.Element[];
};

/**
 * Function to generate GraphData from a list of DataSeries.
 * This function will look through the dataSeries and produce
 * a formatted set that falls within the given time range.
 * then it will return the graphData.
 * @param data The dataseries you want to include in the graph
 * @param startTime Startime for graph
 * @param endTime Endtime for graph
 * @param title Optional title for multigraphs
 * @returns GraphData object.
 */
export const generateGraphData = (
  data: DataSeries[],
  startTime: number,
  endTime: number,
  title?: string,
  error?: JSX.Element,
): GraphData => {
  /** Try to catch problem cases */
  if (data.length === 0 || error) {
    const graphData: GraphData = {
      graphData: data,
      title: title,
      startTime: startTime,
      endTime: endTime,
      error: error,
    };
    return graphData;
  }
  const filteredData: DataSeries[] = [];
  data.forEach((series) => {
    if (series.spellTracker.length === 0) {
      return;
    }

    // Make new filtered SpellTracker
    const filteredSpellTracker: SpellTracker[] = [];

    // Make sure the data is in the right order
    series.spellTracker.sort((a, b) => a.timestamp - b.timestamp);

    let prevEntry: SpellTracker = series.spellTracker[0];
    let endFound = false;

    for (const entry of series.spellTracker) {
      const timestamp = entry.timestamp;
      const count = entry.count;

      if (timestamp < startTime && series.type !== 'point') {
        filteredSpellTracker[0] = { timestamp: startTime, count: count };
        prevEntry = entry;
      }

      if (timestamp >= startTime && timestamp <= endTime) {
        if (filteredSpellTracker.length === 0 && series.type !== 'point') {
          // Give initial value so a line doesnt just abruptly appear
          filteredSpellTracker.push({
            timestamp: startTime,
            count: 0,
            tooltip: entry.tooltip,
          });
        }
        filteredSpellTracker.push({
          timestamp: timestamp,
          count: count,
          tooltip: entry.tooltip,
        });
        prevEntry = entry;
      } else if (timestamp > endTime) {
        if (series.type !== 'point') {
          filteredSpellTracker.push({
            timestamp: endTime,
            count: prevEntry.count,
            tooltip: entry.tooltip,
          });
        }
        endFound = true;
        break;
      }
    }

    if (!endFound && series.type !== 'point') {
      filteredSpellTracker.push({
        timestamp: endTime,
        count: prevEntry.count,
      });
    }

    filteredData.push({
      spellTracker: filteredSpellTracker,
      type: series.type,
      color: series.color,
      label: series.label,
      strokeWidth: series.strokeWidth,
      hideTooltip: series.hideTooltip,
    });
  });

  const graphData: GraphData = {
    graphData: filteredData,
    title: title,
    startTime: startTime,
    endTime: endTime,
    error: error,
  };
  return graphData;
};

const ExplanationGraph: React.FC<Props> = ({
  fightStartTime,
  fightEndTime,
  graphData,
  yAxisName,
  explanations,
}) => {
  /** Logic for handling display of windows */
  const [currentWindowIndex, setCurrentWindowIndex] = useState(0);

  const goToNextWindow = () => {
    setCurrentWindowIndex((prevIndex) => (prevIndex + 1) % graphData.length);
  };
  const goToPrevWindow = () => {
    setCurrentWindowIndex((prevIndex) => (prevIndex - 1 + graphData.length) % graphData.length);
  };

  if (graphData.length === 0) {
    return (
      <div>
        <big>No data to display.</big>
      </div>
    );
  }

  const currentWindow = graphData[currentWindowIndex];
  let currentGraph: GraphData;
  let colorRange: string[] = [];

  if (currentWindow) {
    currentGraph = graphData[currentWindowIndex];
    /** Generate color range
     * Need to do this if we want to make legends
     * without losing our colors. I looooooove VegaLite : ) */
    colorRange = [];

    for (const type of ['area', 'line', 'point']) {
      const elements = currentGraph.graphData.filter((dataSeries) => dataSeries.type === type);
      for (const element of elements) {
        colorRange.push(element.color);
      }
    }
  }

  function generateAreas(): Array<UnitSpec<Field> | LayerSpec<Field>> {
    const areas: UnitSpec<Field>[] = [];
    currentGraph.graphData.forEach((dataSeries) => {
      if (dataSeries.type === 'area') {
        areas.push({
          ...area(dataSeries.spellTracker, dataSeries.label, dataSeries.strokeWidth),
        });
      }
    });

    return areas;
  }

  function generateLines(): Array<UnitSpec<Field> | LayerSpec<Field>> {
    const lines: UnitSpec<Field>[] = [];
    currentGraph.graphData.forEach((dataSeries) => {
      if (dataSeries.type === 'line') {
        lines.push({
          ...line(dataSeries.spellTracker, dataSeries.label, dataSeries.size),
        });
      }
    });

    return lines;
  }

  function generatePoints(): Array<UnitSpec<Field> | LayerSpec<Field>> {
    const points: UnitSpec<Field>[] = [];
    currentGraph.graphData.forEach((dataSeries) => {
      if (dataSeries.type === 'point') {
        const tooltip = dataSeries.hideTooltip ? '' : 'tooltip';
        points.push({
          ...point(dataSeries.spellTracker, dataSeries.label, tooltip, dataSeries.size),
        });
      }
    });

    return points;
  }

  /** Show ticks every second */
  const tickCount =
    (graphData[currentWindowIndex].endTime - graphData[currentWindowIndex].startTime) / 1000;
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
      title: yAxisName,
    },
  };

  const line = (data: InlineData, label: string, size?: number): UnitSpec<Field> => ({
    data: { values: data },
    mark: {
      type: 'line',
      interpolate: 'step-after',
      size: size ?? 3,
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

  const area = (data: InlineData, label: string, strokeWidth?: number): UnitSpec<Field> => ({
    data: { values: data },
    mark: {
      type: 'area',
      interpolate: 'step-after',
      line: {
        strokeWidth: strokeWidth ?? 0.5,
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

  const point = (
    data: InlineData,
    label: string,
    tooltipFieldName: string,
    size?: number,
  ): UnitSpec<Field> => ({
    data: { values: data },
    mark: {
      type: 'point' as const,
      shape: 'circle',
      filled: true,
      size: size ?? 120,
      opacity: 1,
    },
    encoding: {
      tooltip: tooltipFieldName ? { field: tooltipFieldName, type: 'nominal' } : {},
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
  const spec: VisualizationSpec = {
    encoding: {
      x: xAxis,
      y: yAxis,
      color: {
        scale: { range: colorRange },
        legend: {
          symbolOpacity: 1,
        },
      },
    },

    /** We generate our different layers individually else it starts overwriting each other and it's a mess */
    layer: [...generateAreas(), ...generateLines(), ...generatePoints()],
  };

  // If the x-axis is too long, we enable horizontal scrolling, for better readability
  const graphLength =
    graphData[currentWindowIndex].endTime - graphData[currentWindowIndex].startTime;
  const threshold = 0.6 * 60 * 1000;

  // Calculate the width percentage so the graph has consistent size
  const widthPercentage = graphLength > threshold ? (graphLength / threshold) * 100 : 100;

  return (
    <div className={explanations ? 'graph-explanation-container' : ''}>
      {explanations && explanations[currentWindowIndex]}
      <div className="graph-window-container">
        {graphData.length > 1 && (
          <header>
            <span>
              {graphData[currentWindowIndex].title ? graphData[currentWindowIndex].title : 'Fight'}:{' '}
              {currentWindowIndex + 1} out of {graphData.length}
            </span>
            <div className="btn-group">
              <button onClick={goToPrevWindow} disabled={currentWindowIndex === 0}>
                <span
                  className="icon-button glyphicon glyphicon-chevron-left"
                  aria-hidden="true"
                ></span>
              </button>
              <button
                onClick={goToNextWindow}
                disabled={currentWindowIndex === graphData.length - 1}
              >
                <span
                  className="icon-button glyphicon glyphicon-chevron-right"
                  aria-hidden="true"
                ></span>
              </button>
            </div>
          </header>
        )}
        <div
          className="graph-container"
          style={{
            width: '100%',
            overflowX: graphLength > threshold ? 'auto' : 'hidden', // Enable horizontal scrolling if the data length exceeds the threshold
          }}
        >
          {!graphData[currentWindowIndex].error ? (
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
                      currentGraph: currentGraph,
                      yAxisName: yAxisName,
                    }}
                    width={width}
                    height={height}
                  />
                )}
              </AutoSizer>
            </div>
          ) : (
            graphData[currentWindowIndex].error
          )}
        </div>
      </div>
    </div>
  );
};

export default ExplanationGraph;
