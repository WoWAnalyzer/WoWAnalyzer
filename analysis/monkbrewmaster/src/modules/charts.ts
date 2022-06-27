import { Info } from 'parser/core/metric';
import { formatTime } from 'parser/ui/BaseChart';
import { Field, PositionDef } from 'vega-lite/build/src/channeldef';
import { NonNormalizedSpec } from 'vega-lite/build/src/spec';
import { UnitSpec } from 'vega-lite/build/src/spec/unit';
import { Transform } from 'vega-lite/build/src/transform';

export const POINT_SIZE = 75;

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
    zero: false,
    nice: false,
  },
  title: null,
};

export const staggerAxis: PositionDef<Field> = {
  field: 'newPooledDamage',
  type: 'quantitative',
  title: 'Staggered Damage',
  axis: {
    gridOpacity: 0.3,
    format: '~s',
  },
};

export const staggerChart: Partial<NonNormalizedSpec> = {
  encoding: {
    x: timeAxis,
    y: staggerAxis,
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
    size: POINT_SIZE,
  },
});

export const color = {
  stagger: '#fab700',
  potentialStagger: 'lightblue',
  purify: '#00ff96',
};
