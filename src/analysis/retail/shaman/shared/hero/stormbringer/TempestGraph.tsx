import { formatDuration } from 'common/format';
import SPECS from 'game/SPECS';
import { Info } from 'parser/core/metric';
import { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import { expressionFunction, Interpolate, SignalRef } from 'vega';
import { StringFieldDef } from 'vega-lite/build/src/channeldef';
import { CompositeEncoding } from 'vega-lite/build/src/compositemark';
import { OverlayMarkDef } from 'vega-lite/build/src/mark';
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

  const interpolate: Interpolate | undefined = 'linear';
  const strokeWidth = 1;
  const point: OverlayMarkDef<SignalRef> | undefined = { filled: false };
  const tooltip: StringFieldDef<any> = {
    field: 'value',
    type: 'quantitative',
  };

  const spec: VisualizationSpec = {
    layer: [
      /** Maelstrom progress */
      {
        data: {
          name: 'maelstrom',
        },
        mark: {
          type: 'area',
          point: point,
          line: {
            interpolate: interpolate,
            color: colors.maelstrom,
            strokeWidth: strokeWidth,
            opacity: 1,
          },
          interpolate: interpolate,
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
              tickCount: info.combatant.spec === SPECS.ENHANCEMENT_SHAMAN ? 4 : 6,
            },
          },
          tooltip: [
            {
              ...tooltip,
              title: 'Maelstrom',
            },
          ],
          color: {
            value: colors.maelstrom,
          },
        },
      },

      /** Awakening Storms stacks */
      {
        data: {
          name: 'awakeningStorms',
        },
        mark: {
          type: 'area',
          point: point,
          line: {
            color: colors.awakeningStorms,
            interpolate: interpolate,
            opacity: 1,
            strokeWidth: strokeWidth,
          },
          opacity: 0.1,
          interpolate: interpolate,
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
              tickCount: 3,
            },
          },
          tooltip: [
            {
              ...tooltip,
              title: 'Awakening Storms stacks',
            },
          ],
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
          color: '#fab700',
          strokeWidth: 2,
          opacity: 1,
        },
        encoding: {
          x: baseEncoding.x,
          tooltip: [
            {
              field: 'timestamp_shifted',
              type: 'quantitative',
              title: 'Tempest Cast',
              formatType: 'timestamp',
              format: '3',
            },
          ],
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

expressionFunction('timestamp', function (datum: number, params: string) {
  return formatDuration(datum, Number(params));
});
