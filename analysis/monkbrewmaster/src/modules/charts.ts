import { Info } from 'parser/core/metric';
import { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import { Field, PositionDef } from 'vega-lite/build/src/channeldef';
import { UnitSpec } from 'vega-lite/build/src/spec/unit';
import { Transform } from 'vega-lite/build/src/transform';

export const normalizeTimestampTransform = (info: Info, key: string = 'timestamp'): Transform => ({
  calculate: `datum.${key} - ${info.fightStart}`,
  as: 'timestamp',
});

export const timeAxis: PositionDef<Field> = {
  field: 'timestamp',
  type: 'quantitative',
  axis: {
    labelExpr: formatTime('datum.value'),
    tickMinStep: 5000,
    grid: false,
  },
  scale: {
    nice: false,
  },
  title: null,
};

export const staggerChart: Partial<VisualizationSpec> = {
  encoding: {
    x: timeAxis,
    y: {
      field: 'newPooledDamage',
      type: 'quantitative',
      title: 'Staggered Damage',
      axis: {
        gridOpacity: 0.3,
        format: '~s',
      },
    },
  },
};

export const line = (dataName: string, color: string): UnitSpec<Field> => ({
  data: { name: dataName },
  mark: {
    type: 'line',
    interpolate: 'step-after',
    color: color,
  },
});

export const point = (dataName: string, color: string): UnitSpec<Field> => ({
  data: { name: dataName },
  mark: {
    type: 'point',
    filled: true,
    color: color,
    opacity: 1,
    size: 50,
  },
});

export const color = {
  stagger: '#fab700',
  potentialStagger: 'lightblue',
  purify: '#00ff96',
};
