import talents from 'common/TALENTS/monk';
import HIT_TYPES from 'game/HIT_TYPES';
import { DamageEvent, EventType, RemoveStaggerEvent } from 'parser/core/Events';
import BaseChart, { defaultConfig } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';
import { Field } from 'vega-lite/build/src/channeldef';
import { UnitSpec } from 'vega-lite/build/src/spec';

import {
  color,
  line,
  normalizeTimestampTransform,
  point,
  timeAxis,
  staggerAxis,
} from '../../charts';
import type { CommonProps } from './index';

function displayCriticalHit(damage: DamageEvent[]): string {
  if (damage.every((event) => event.hitType === HIT_TYPES.CRIT)) {
    return 'Yes';
  } else if (damage.some((event) => event.hitType === HIT_TYPES.CRIT)) {
    return 'Partial';
  } else {
    return 'No';
  }
}

export function InvokeNiuzaoSummaryChart({
  cast,
  info,
  events: allEvents,
}: CommonProps): JSX.Element {
  const startTime = cast.startEvent.timestamp - 8000;
  const endTime = cast.endEvent.timestamp + 2000;
  const events = allEvents.filter(
    ({ timestamp }) => timestamp >= startTime && timestamp <= endTime,
  );

  const davePool = cast.stomps.flatMap(({ purifies, event }, index) => [
    ...purifies.reduce(
      (result, { timestamp, amount }) => {
        const prevAmount = result.length > 0 ? result[result.length - 1].amount : 0;
        const next = {
          timestamp,
          amount: prevAmount + amount / 4,
          stomp: index,
        };
        result.push(next);
        return result;
      },
      [] as Array<{ timestamp: number; amount: number; stomp: number }>,
    ),
    {
      timestamp: event.timestamp,
      amount: 0,
      stomp: index,
      fake: true,
    },
  ]);

  const data = {
    stagger: events.filter(
      ({ type }) => type === EventType.RemoveStagger || type === EventType.AddStagger,
    ),
    purifies: events
      .filter(
        (event) =>
          event.type === EventType.RemoveStagger &&
          event.trigger?.ability.guid === talents.PURIFYING_BREW_TALENT.id,
      )
      .map((e) => {
        const event = e as RemoveStaggerEvent;
        const other = davePool.find(({ timestamp }) => timestamp === event.timestamp);
        return {
          ...event,
          newPooledDamage: event.newPooledDamage + event.amount,
          hasStomp: other !== undefined,
          stomp: other?.stomp ?? -1,
        };
      }),
    davePool,
    stomps: cast.stomps.map((stomp, index) => ({
      timestamp: stomp.event.timestamp,
      amount: stomp.damage.reduce((total, { amount }) => total + amount, 0),
      staggerContribution: stomp.purifies.reduce((total, { amount }) => total + amount, 0) / 4,
      displayCritical: displayCriticalHit(stomp.damage),
      stomp: index,
    })),
    window: [
      {
        timestamp: cast.startEvent.timestamp,
        end: cast.endEvent.timestamp,
      },
    ],
  };

  const windowSpec: UnitSpec<Field> = {
    data: {
      name: 'window',
    },
    mark: {
      type: 'rect',
      color: 'lightblue',
      opacity: 0.3,
    },
    transform: [
      normalizeTimestampTransform(info),
      {
        calculate: `datum.end - ${info.fightStart}`,
        as: 'end',
      },
    ],
    encoding: {
      x2: {
        ...timeAxis,
        field: 'end',
      },
    },
  };

  const scale = {
    zero: false,
    nice: false,
    domain: [
      events[0].timestamp - info.fightStart,
      events[events.length - 1].timestamp - info.fightStart,
    ],
  };

  const highlightSelection = {
    condition: {
      param: 'selectedStomp',
      empty: false,
      value: 'white',
    },
    value: 'transparent',
  };

  const stompSelection: Partial<UnitSpec<Field>> = {
    params: [
      {
        name: 'selectedStomp',
        select: { type: 'point', on: 'mouseover', fields: ['stomp'] },
      },
    ],
  };

  const specBuilder = (width: number, height: number): VisualizationSpec => ({
    vconcat: [
      {
        height: height / 2 - 20,
        width,
        encoding: {
          x: {
            ...timeAxis,
            scale,
            axis: null,
          },
        },
        layer: [
          windowSpec,
          {
            ...line('stagger', color.stagger),
            transform: [normalizeTimestampTransform(info)],
            encoding: { y: { ...staggerAxis, title: 'Stagger' } },
          },
          {
            ...stompSelection,
            ...point('purifies', color.purify),
            transform: [
              normalizeTimestampTransform(info),
              {
                calculate: 'if(datum.hasStomp, "Yes", "No")',
                as: 'readableHasStomp',
              },
            ],
            encoding: {
              y: { ...staggerAxis, title: 'Stagger' },
              stroke: highlightSelection,
              color: {
                field: 'hasStomp',
                type: 'nominal',
                legend: null,
                scale: {
                  domain: [false, true],
                  range: ['white', color.purify],
                },
              },
              tooltip: [
                {
                  field: 'amount',
                  type: 'quantitative',
                  format: '.3~s',
                  title: 'Amount Purified',
                },
                {
                  field: 'readableHasStomp',
                  type: 'nominal',
                  title: 'Buffed a Stomp',
                },
              ],
            },
          },
        ],
      },
      {
        height: height / 2 - 20,
        width,
        encoding: {
          x: {
            ...timeAxis,
            scale,
          },
        },
        layer: [
          windowSpec,
          {
            ...line('davePool', 'white'),
            transform: [normalizeTimestampTransform(info)],
            encoding: {
              y: {
                title: 'Stomp',
                type: 'quantitative',
                axis: {
                  gridOpacity: 0.3,
                  format: '~s',
                },
                field: 'amount',
              },
            },
          },
          {
            ...point('davePool', color.purify),
            transform: [
              normalizeTimestampTransform(info),
              {
                filter: '!datum.fake',
              },
            ],
            encoding: {
              stroke: highlightSelection,
              y: {
                title: 'Stomp',
                type: 'quantitative',
                axis: {
                  gridOpacity: 0.3,
                  format: '~s',
                },
                field: 'amount',
              },
              tooltip: [
                {
                  field: 'amount',
                  type: 'quantitative',
                  title: 'Stagger Contribution',
                  format: '.3~s',
                },
              ],
            },
          },
          {
            ...stompSelection,
            data: { name: 'stomps' },
            mark: {
              type: 'bar',
              color: 'hsl(25.9, 25%, 50.5%)',
            },
            transform: [normalizeTimestampTransform(info)],
            encoding: {
              y: {
                type: 'quantitative',
                axis: {
                  gridOpacity: 0.3,
                  format: '~s',
                },
                field: 'amount',
              },
              stroke: highlightSelection,
              tooltip: [
                {
                  title: 'Damage',
                  field: 'amount',
                  type: 'quantitative',
                  format: '.3~s',
                },
                {
                  title: 'Stagger Contribution',
                  field: 'staggerContribution',
                  type: 'quantitative',
                  format: '.3~s',
                },
                {
                  title: 'Critical Hit?',
                  field: 'displayCritical',
                  type: 'nominal',
                },
              ],
            },
          },
        ],
      },
    ],
  });

  return (
    <AutoSizer>
      {({ width, height }) => (
        <BaseChart
          data={data}
          spec={/* HACK: not sure why this doubles the width */ specBuilder(width / 2 - 30, height)}
          config={{
            ...defaultConfig,
            autosize: {
              type: 'pad',
              contains: 'padding',
            },
          }}
        />
      )}
    </AutoSizer>
  );
}
