import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';

interface Vector2 {
  x: number;
  y: number;
}

interface Props {
  mana: Vector2[];
  healing: Vector2[];
  manaUsed: Vector2[];
}

export const ManaUsageGraph = ({ mana, healing, manaUsed }: Props) => {
  const spec: VisualizationSpec = {
    data: {
      name: 'combined',
    },
    mark: {
      type: 'area',
      line: {
        strokeWidth: 1,
      },
    },
    encoding: {
      x: {
        field: 'x',
        type: 'quantitative',
        axis: {
          labelExpr: formatTime('datum.value * 1000'),
          grid: false,
        },
        title: null,
        scale: { zero: true, nice: false },
      },
      y: {
        field: 'y',
        type: 'quantitative',
        title: null,
      },
      color: {
        field: 'kind',
        scale: {
          scheme: 'blues', //[COLORS.HEALING.border, COLORS.MANA.border, COLORS.MANA_USED.border],
        },
        title: null,
        legend: {
          orient: 'top',
        },
      },
    },
  };
  const data = {
    combined: [
      ...mana.map((e) => ({ ...e, kind: 'Mana' })),
      ...healing.map((e) => ({ ...e, kind: 'HPS' })),
      ...manaUsed.map((e) => ({ ...e, kind: 'Mana Used' })),
    ],
  };

  return (
    <AutoSizer disableHeight>
      {({ width }) => <BaseChart height={400} width={width} spec={spec} data={data} />}
    </AutoSizer>
  );
};

export default ManaUsageGraph;
