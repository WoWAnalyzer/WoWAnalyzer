import { GoodColor, useEvents, useInfo } from 'interface/guide';
import { DamageEvent, EventType } from 'parser/core/Events';
import BaseChart, { defaultConfig, formatTime } from 'parser/ui/BaseChart';
import { memo } from 'react';
import { SignalListener, VisualizationSpec } from 'react-vega';
import { BuffWindow } from './buffWindows';

const BUFF_WINDOW_SHIFT = 500;
const DAMAGE_AREA_COLOR = '#e8b339';

/** Pixels reserved on the left of the container for axis labels. The chart's
 *  data plot starts at this pixel offset so cooldown rows below align here. */
export const CHART_DATA_PLOT_LEFT_OFFSET = 50;

export const DamageDoneChart = memo(
  ({
    buffWindows,
    yScale,
    width,
    onHover,
  }: {
    buffWindows: BuffWindow[];
    yScale?: number;
    width: number;
    onHover?: SignalListener;
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
          params: [
            {
              name: 'hover',
              select: {
                type: 'point',
                on: 'mouseover',
                clear: 'mouseout',
                fields: ['startTime'],
              },
            },
          ],
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

    return (
      <div style={{ display: 'grid', justifyItems: 'end', width }}>
        <BaseChart
          data={data}
          width={width - CHART_DATA_PLOT_LEFT_OFFSET}
          height={200}
          spec={spec}
          config={{ ...defaultConfig, autosize: { type: 'pad', contains: 'content' } }}
          signalListeners={onHover ? { hover: onHover } : undefined}
        />
      </div>
    );
  },
);
