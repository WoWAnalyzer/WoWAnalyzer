import { UnitSpec } from 'vega-lite/build/src/spec';
import { Field } from 'vega-lite/build/src/channeldef';
import { InlineData } from 'vega-lite/build/src/data';
import './Styling.scss';

type LineParams = {
  data: InlineData;
  label: string;
  size?: number;
  fightStartTime: number;
};

export const line = ({ data, fightStartTime, label, size }: LineParams): UnitSpec<Field> => ({
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

type AreaParams = {
  data: InlineData;
  label: string;
  strokeWidth?: number;
  fightStartTime: number;
};

export const area = ({
  data,
  fightStartTime,
  label,
  strokeWidth,
}: AreaParams): UnitSpec<Field> => ({
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

type PointParams = {
  data: InlineData;
  label: string;
  tooltipFieldName: string;
  size?: number;
  fightStartTime: number;
};

export const point = ({
  data,
  label,
  tooltipFieldName,
  size,
  fightStartTime,
}: PointParams): UnitSpec<Field> => ({
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
