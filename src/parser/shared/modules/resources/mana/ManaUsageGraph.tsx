import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import React from 'react';
import { AutoSizer } from 'react-virtualized';
import { VisualizationSpec } from 'react-vega';

const COLORS = {
  MANA: {
    background: 'rgba(2, 109, 215, 0.25)',
    border: 'rgba(2, 109, 215, 0.6)',
  },
  HEALING: {
    background: 'rgba(2, 217, 110, 0.2)',
    border: 'rgba(2, 217, 110, 0.6)',
  },
  MANA_USED: {
    background: 'rgba(215, 2, 6, 0.4)',
    border: 'rgba(215, 2, 6, 0.6)',
  },
};

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
