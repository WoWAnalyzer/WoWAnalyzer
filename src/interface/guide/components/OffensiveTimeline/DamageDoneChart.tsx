import { GoodColor, useEvents, useInfo } from 'interface/guide';
import { DamageEvent, EventType } from 'parser/core/Events';
import BaseChart, { defaultConfig, formatTime } from 'parser/ui/BaseChart';
import { memo } from 'react';
import { VisualizationSpec } from 'react-vega';
import { BuffWindow } from './buffWindows';

const BUFF_WINDOW_SHIFT = 500;
const DAMAGE_AREA_COLOR = '#e8b339';

/** Pixel padding inside the chart between its left edge and the data plot.
 *  The cooldown rows below the chart use this to align with the data plot. */
export const CHART_LEFT_PADDING = 55;
/** Pixel padding inside the chart between its right edge and the data plot. */
export const CHART_RIGHT_PADDING = 20;

export const DamageDoneChart = memo(
  ({
    buffWindows,
    yScale,
    width,
  }: {
    buffWindows: BuffWindow[];
    yScale?: number;
    width: number;
  }) => {
    const events = useEvents();
    const info = useInfo();

    if (!info) {
      return null;
    }

    const damageData = events
      .filter(
        (event): event is DamageEvent =>
          event.type === EventType.Damage && event.sourceID === info.combatant.id,
      )
      .map((event) => ({ timestamp: event.timestamp, amount: event.amount }));

    const buffData = buffWindows.map((w) => ({
      startTime: w.startTime,
      endTime: w.endTime,
      color: w.color ?? GoodColor,
    }));

    const data = {
      buffs: buffData,
      events: damageData,
    };

    const spec: VisualizationSpec = {
      padding: { left: CHART_LEFT_PADDING, right: CHART_RIGHT_PADDING, top: 5, bottom: 25 },
      layer: [
        {
          mark: {
            type: 'rect',
            opacity: 0.55,
          },
          data: { name: 'buffs' },
          encoding: {
            x: { field: 'startTime', type: 'quantitative' },
            x2: { field: 'endTime', type: 'quantitative' },
            color: {
              field: 'color',
              type: 'nominal',
              scale: null,
              legend: null,
            },
          },
        },
        {
          mark: {
            type: 'area',
            interpolate: 'monotone',
            color: DAMAGE_AREA_COLOR,
            stroke: 'black',
            strokeWidth: 0.5,
          },
          data: { name: 'events' },
          transform: [
            { calculate: `datum.timestamp - ${info.fightStart}`, as: 'timestamp' },
            { calculate: 'floor(datum.timestamp / 1000)', as: 'binIx' },
            {
              aggregate: [
                { op: 'sum', as: 'amount', field: 'amount' },
                { op: 'min', as: 'timestamp', field: 'binIx' },
              ],
              groupby: ['binIx'],
            },
            { calculate: 'datum.timestamp * 1000', as: 'timestamp' },
            {
              impute: 'amount',
              key: 'timestamp',
              keyvals: { start: 0, stop: info.fightDuration, step: 1000 },
              value: 0,
            },
            { calculate: `datum.timestamp + ${BUFF_WINDOW_SHIFT}`, as: 'timestamp' },
          ],
          encoding: {
            x: {
              field: 'timestamp',
              type: 'quantitative',
              axis: { labelExpr: formatTime('datum.value'), grid: false },
              title: null,
              scale: { zero: true, nice: false },
            },
            y: {
              field: 'amount',
              title: 'Damage Done per Second',
              type: 'quantitative',
              axis: { format: '~s', grid: false },
              scale: { zero: true, ...(yScale ? { domain: [0, yScale] } : {}) },
            },
          },
        },
      ],
    };

    return <BaseChart data={data} width={width} height={200} spec={spec} config={defaultConfig} />;
  },
);
