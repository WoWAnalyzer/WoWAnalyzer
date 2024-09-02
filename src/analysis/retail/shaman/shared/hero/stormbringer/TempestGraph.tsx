import { Info } from 'parser/core/metric';
import { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import { CompositeEncoding } from 'vega-lite/build/src/compositemark';
import { Transform } from 'vega-lite/build/src/transform';

export const tempestGraph = (info: Info): VisualizationSpec => {
  const colors = {
    maelstrom: '#00D1FF',
    awakeningStorms: '#0080FF',
  };

  const baseEncoding: CompositeEncoding<any> = {
    x: {
      field: 'timestamp_shifted',
      type: 'quantitative',
      axis: {
        labelExpr: formatTime('datum.value'),
        tickCount: 25,
        grid: false,
      },
      scale: { zero: true, nice: false },
      title: 'Time',
    },
  };

  const transforms: Transform[] = [
    {
      calculate: `datum.timestamp - ${info.fightStart}`,
      as: 'timestamp_shifted',
    },
  ];

  const spec: VisualizationSpec = {
    layer: [
      /** Maelstrom progress */
      {
        data: {
          name: 'maelstrom',
        },
        mark: {
          type: 'area',
          line: {
            interpolate: 'step',
            color: colors.maelstrom,
            strokeWidth: 1,
            opacity: 1,
          },
          interpolate: 'step',
          opacity: 0.1,
        },
        transform: transforms,
        encoding: {
          ...baseEncoding,
          y: {
            field: 'value',
            type: 'quantitative',
            title: 'Maelstrom',
            axis: {
              grid: false,
              format: '~s',
              orient: 'left',
            },
          },
          color: { value: colors.maelstrom },
        },
      },

      /** Awakening Storms stacks */
      {
        data: {
          name: 'awakeningStorms',
        },
        mark: {
          type: 'area',
          line: {
            color: colors.awakeningStorms,
            interpolate: 'step',
            opacity: 1,
            strokeWidth: 1,
          },
          opacity: 0.1,
          interpolate: 'step',
        },
        transform: transforms,
        encoding: {
          ...baseEncoding,
          y: {
            field: 'value',
            type: 'quantitative',
            title: 'Awakening Storms',
            axis: {
              orient: 'right',
            },
          },
          color: { value: colors.awakeningStorms },
        },
      },

      /** Tempest casts */
      {
        data: {
          name: 'tempest',
        },
        mark: {
          type: 'rule',
          color: 'red',
          strokeWidth: 2,
          opacity: 0.3,
        },
        encoding: {
          x: baseEncoding.x,
        },
        transform: transforms,
      },
    ],
    resolve: {
      scale: {
        y: 'independent',
      },
    },
  };

  return spec;
};
