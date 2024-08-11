import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
import { GoodColor, useEvents, useInfo } from 'interface/guide';
import { DamageEvent, EventType } from 'parser/core/Events';
import BaseChart, { defaultConfig, formatTime } from 'parser/ui/BaseChart';
import React from 'react';
import { SignalListener, VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';
import MajorDefensive from './MajorDefensiveAnalyzer';

const rekey = (key: string) =>
  function <T>(value: T): T & { key: string } {
    return { ...value, key };
  };

// we have to memo this for reasons unbeknownst to me, but it fixes the onHover not getting called with the null value.
export const DamageMitigationChart = React.memo(
  ({
    onHover,
    analyzers,
    yScale,
  }: {
    onHover: SignalListener;
    analyzers: readonly MajorDefensive<any, any>[];
    yScale?: number;
  }) => {
    const events = useEvents();
    const info = useInfo();
    const listeners = { hover: onHover };

    // shift to help deal with interpolation slope
    const BUFF_WINDOW_SHIFT = 500;

    const physicalData = events
      .filter(
        (event): event is DamageEvent =>
          event.type === EventType.Damage &&
          event.targetID === info?.combatant.id &&
          event.ability.type === MAGIC_SCHOOLS.ids.PHYSICAL,
      )
      .map(rekey('physical'));

    const magicData = events
      .filter(
        (event): event is DamageEvent =>
          event.type === EventType.Damage &&
          event.targetID === info?.combatant.id &&
          event.ability.type !== MAGIC_SCHOOLS.ids.PHYSICAL,
      )
      .map(rekey('magic'));

    const mitigationData = analyzers.flatMap((analyzer) => {
      if (!analyzer) {
        return [];
      }

      return analyzer.mitigations
        .flatMap((mit) => mit.mitigated)
        .map((mit) => ({ ...mit, amount: mit.mitigatedAmount, timestamp: mit.event.timestamp }))
        .map(rekey('.mitigated'));
    });

    const buffData = analyzers.flatMap((analyzer) => {
      if (!analyzer) {
        return [];
      }

      return analyzer.mitigations.map((mit, index) => ({
        startTime: mit.start.timestamp - (info?.fightStart ?? 0),
        endTime: mit.end.timestamp - (info?.fightStart ?? 0),
        amount: mit.amount,
        key: analyzer.constructor.name,
        index,
      }));
    });

    const data = {
      buffs: buffData,
      events: (physicalData as Array<Pick<DamageEvent, 'amount' | 'timestamp'> & { key: string }>)
        .concat(magicData)
        .concat(mitigationData),
    };

    const maxHp =
      physicalData.find((event) => event.maxHitPoints !== undefined)?.maxHitPoints ??
      magicData.find((event) => event.maxHitPoints !== undefined)?.maxHitPoints ??
      400000;

    const spec: VisualizationSpec = {
      layer: [
        {
          mark: {
            type: 'rect',
            color: GoodColor,
            opacity: 0.9,
          },
          data: {
            name: 'buffs',
          },
          encoding: {
            x: {
              field: 'startTime',
              type: 'quantitative',
            },
            x2: {
              field: 'endTime',
              type: 'quantitative',
            },
          },
          params: [
            {
              name: 'hover',
              select: {
                type: 'point',
                on: 'mouseover',
                clear: 'mouseout',
                fields: ['key', 'index', 'startTime'],
              },
            },
          ],
        },
        {
          mark: {
            type: 'area',
            interpolate: 'monotone',
            color: color(MAGIC_SCHOOLS.ids.PHYSICAL),
            stroke: 'black',
            strokeWidth: 0.5,
          },
          data: {
            name: 'events',
          },
          transform: [
            { calculate: `datum.timestamp - ${info?.fightStart ?? 0}`, as: 'timestamp' },
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
              keyvals: { start: 0, stop: info?.fightDuration ?? 0, step: 1000 },
              value: 0,
            },
            { calculate: `datum.timestamp + ${BUFF_WINDOW_SHIFT}`, as: 'timestamp' },
          ],
          encoding: {
            x: {
              field: 'timestamp',
              type: 'quantitative',
              axis: {
                labelExpr: formatTime('datum.value'),
                grid: false,
              },
              title: null,
              scale: { zero: true, nice: false },
            },
            y: {
              field: 'amount',
              title: 'Damage Taken per Second',
              type: 'quantitative',
              axis: { format: '~s', grid: false },
              scale: { zero: true, domain: { unionWith: [0, maxHp * (yScale || 1)] } },
              stack: true,
            },
          },
        },
      ],
    };

    return (
      <div>
        <AutoSizer disableHeight>
          {({ width }) => (
            <div style={{ display: 'grid', justifyItems: 'end', width }}>
              <BaseChart
                data={data}
                width={width - 50}
                height={200}
                spec={spec}
                config={{ ...defaultConfig, autosize: { type: 'pad', contains: 'content' } }}
                signalListeners={listeners}
              />
            </div>
          )}
        </AutoSizer>
      </div>
    );
  },
);
