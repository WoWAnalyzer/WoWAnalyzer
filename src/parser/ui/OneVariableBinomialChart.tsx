import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';

import BaseChart from './BaseChart';

interface Point {
  x: number;
  y: number;
}

interface Props {
  probabilities: Point[];
  actualEvent: Point;
  xAxis: {
    title: string;
    tickFormat: string;
  };
  yAxis: {
    title: string;
  };
  yDomain: [number, number];
  tooltip: string;
}

export default function OneVariableBinomialChart({
  probabilities,
  actualEvent,
  xAxis,
  yAxis,
  yDomain,
  tooltip,
}: Props) {
  const data = {
    probabilities,
    actual: actualEvent,
  };

  const spec: VisualizationSpec = {
    encoding: {
      x: {
        field: 'x',
        type: 'quantitative',
        title: xAxis.title,
        axis: {
          grid: false,
          format: xAxis.tickFormat,
        },
      },
      y: {
        field: 'y',
        type: 'quantitative',
        title: yAxis.title,
        axis: {
          grid: false,
          format: '.0%',
        },
        scale: {
          domain: yDomain,
        },
      },
    },
    layer: [
      {
        data: {
          name: 'probabilities',
        },
        mark: {
          type: 'area',
          color: 'rgba(250, 183, 0, 0.15)',
          line: {
            color: '#fab700',
            strokeWidth: 1,
          },
        },
      },
      {
        data: {
          name: 'actual',
        },
        mark: {
          type: 'point',
          filled: true,
          color: '#00ff96',
          size: 60,
        },
        encoding: {
          tooltip: [{ field: 'x', title: tooltip }],
        },
      },
    ],
  };

  return (
    <AutoSizer disableHeight>
      {({ width }) => <BaseChart height={150} width={width} spec={spec} data={data} />}
    </AutoSizer>
  );
}
