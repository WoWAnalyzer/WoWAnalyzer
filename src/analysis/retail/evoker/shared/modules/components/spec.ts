import { VisualizationSpec } from 'react-vega';
import './Styling.scss';
import { GraphDataType } from './types';
import { generateAreas, generateLines, generatePoints } from './generateFunctions';

type Params = {
  xAxis: object;
  yAxis: object;
  colorRange: string[];
  currentGraph: GraphDataType;
  fightStartTime: number;
};

const spec = ({
  colorRange,
  currentGraph,
  fightStartTime,
  xAxis,
  yAxis,
}: Params): VisualizationSpec => ({
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
  layer: [
    ...generateAreas(currentGraph, fightStartTime),
    ...generateLines(currentGraph, fightStartTime),
    ...generatePoints(currentGraph, fightStartTime),
  ],
});

export default spec;
