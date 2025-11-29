import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';
import { CompositeEncoding } from 'vega-lite/build/src/compositemark';

import BaseChart, { formatTime } from './BaseChart';

interface Point {
  x: number;
  y: number;
}
type XPoint = Pick<Point, 'x'>;

interface BossData {
  title: string;
  borderColor?: string;
  backgroundColor?: string;
  data: Point[];
}

interface Props {
  mana: Point[];
  deaths: XPoint[];
  bossData: BossData[];
  height?: number;
}

const ManaLevelGraph = ({ mana, deaths, bossData, height }: Props) => {
  const colors = {
    mana: {
      border: 'rgba(2, 109, 215, 0.6)',
      background: 'rgba(2, 109, 215, 0.25)',
    },
    death: 'rgba(255, 0, 0, 0.8)',
  } as const;
  const baseEncoding: CompositeEncoding<any> = {
    x: {
      field: 'x',
      type: 'quantitative',
      axis: {
        labelExpr: formatTime('datum.value'),
        grid: false,
      },
      title: null,
      scale: { zero: true, nice: false },
    },
    y: {
      field: 'y',
      type: 'quantitative',
      axis: {
        tickCount: 4,
      },
      title: null,
    } as const,
  };

  const spec: VisualizationSpec = {
    layer: [
      {
        data: {
          name: 'bosses',
        },
        transform: [
          { flatten: ['data'] },
          { calculate: 'datum.data.x', as: 'x' },
          { calculate: 'datum.data.y', as: 'y' },
        ],
        mark: {
          type: 'line',
          opacity: 0.6,
          line: {
            interpolate: 'linear',
            strokeWidth: 1,
          },
        },
        encoding: {
          ...baseEncoding,
          color: {
            field: 'title',
            type: 'nominal',
            title: 'Enemy',
            legend: {
              orient: 'top',
            },
            scale: {
              scheme: 'accent',
            },
          },
        },
      },
      {
        data: {
          name: 'mana',
        },
        mark: {
          type: 'area',
          line: {
            interpolate: 'linear',
            color: colors.mana.border,
            strokeWidth: 1,
          },
          color: colors.mana.background,
        },
        encoding: baseEncoding,
      },
      {
        data: {
          name: 'deaths',
        },
        mark: {
          type: 'rule',
          color: 'red',
          strokeWidth: 2,
        },
        encoding: {
          x: baseEncoding.x,
          tooltip: [
            { field: 'name', type: 'nominal', title: 'Target' },
            { field: 'ability', type: 'nominal', title: 'Killing Ability' },
          ],
        },
      },
    ],
  };

  const data = {
    mana,
    deaths,
    bosses: bossData,
  };

  return (
    <AutoSizer disableHeight>
      {({ width }) => <BaseChart height={height ?? 400} width={width} spec={spec} data={data} />}
    </AutoSizer>
  );
};
export default ManaLevelGraph;
