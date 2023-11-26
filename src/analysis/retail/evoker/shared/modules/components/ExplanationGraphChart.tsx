import React from 'react';
import BaseChart from 'parser/ui/BaseChart';
import { AutoSizer } from 'react-virtualized';
import './Styling.scss';
import { GraphDataType } from './types';
import getAxis from './getAxis';
import spec from './spec';

type Props = {
  graphData: GraphDataType[];
  currentWindowIndex: number;
  yAxisName: string;
  fightStartTime: number;
};

const ExplanationGraphChart: React.FC<Props> = ({
  graphData,
  currentWindowIndex,
  yAxisName,
  fightStartTime,
}) => {
  const currentWindow = graphData[currentWindowIndex];
  let currentGraph: GraphDataType;
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

  /** Show ticks every second */
  const tickCount =
    (graphData[currentWindowIndex].endTime - graphData[currentWindowIndex].startTime) / 1000;
  const { xAxis, yAxis } = getAxis(tickCount, yAxisName);

  return (
    <AutoSizer>
      {({ width, height }) => (
        <BaseChart
          spec={spec({ colorRange, currentGraph, fightStartTime, xAxis, yAxis })}
          data={{
            currentGraph: currentGraph,
            yAxisName: yAxisName,
          }}
          width={width}
          height={height}
        />
      )}
    </AutoSizer>
  );
};

export default ExplanationGraphChart;
