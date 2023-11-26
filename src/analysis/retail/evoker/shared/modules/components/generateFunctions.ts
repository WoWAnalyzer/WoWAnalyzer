import { UnitSpec } from 'vega-lite/build/src/spec';
import { Field } from 'vega-lite/build/src/channeldef';
import './Styling.scss';
import { GraphDataType } from './types';
import { area, line, point } from './legend';

export function generateAreas(
  currentGraph: GraphDataType,
  fightStartTime: number,
): UnitSpec<Field>[] | import('vega-lite/build/src/spec').LayerSpec<Field>[] {
  const areas: UnitSpec<Field>[] = [];
  currentGraph.graphData.forEach((dataSeries) => {
    if (dataSeries.type === 'area') {
      areas.push({
        ...area({
          data: dataSeries.spellTracker,
          label: dataSeries.label,
          strokeWidth: dataSeries.strokeWidth,
          fightStartTime,
        }),
      });
    }
  });

  return areas;
}

export function generateLines(
  currentGraph: GraphDataType,
  fightStartTime: number,
): UnitSpec<Field>[] | import('vega-lite/build/src/spec').LayerSpec<Field>[] {
  const lines: UnitSpec<Field>[] = [];
  currentGraph.graphData.forEach((dataSeries) => {
    if (dataSeries.type === 'line') {
      lines.push({
        ...line({
          data: dataSeries.spellTracker,
          label: dataSeries.label,
          size: dataSeries.size,
          fightStartTime,
        }),
      });
    }
  });

  return lines;
}

export function generatePoints(
  currentGraph: GraphDataType,
  fightStartTime: number,
): UnitSpec<Field>[] | import('vega-lite/build/src/spec').LayerSpec<Field>[] {
  const points: UnitSpec<Field>[] = [];
  currentGraph.graphData.forEach((dataSeries) => {
    if (dataSeries.type === 'point') {
      const tooltip = dataSeries.hideTooltip ? '' : 'tooltip';
      points.push({
        ...point({
          data: dataSeries.spellTracker,
          label: dataSeries.label,
          tooltipFieldName: tooltip,
          size: dataSeries.size,
          fightStartTime,
        }),
      });
    }
  });

  return points;
}
