import { formatDuration } from 'common/format';
import { Tooltip } from 'interface';
import { useEvents, useInfo } from 'interface/guide';
import { DamageEvent, EventType } from 'parser/core/Events';
import BaseChart, { defaultConfig, formatTime } from 'parser/ui/BaseChart';
import { memo } from 'react';
import { SignalListener, VisualizationSpec } from 'react-vega';
import { BuffWindow } from 'analysis/retail/druid/balance/modules/guide/OffensiveTimeline/TimeWindows';
import { useFight } from 'interface/report/context/FightContext';
import { useReport } from 'interface/report/context/ReportContext';
import useBossPhaseEvents from 'interface/report/hooks/useBossPhaseEvents';

const BUFF_WINDOW_SHIFT = 500;
const DAMAGE_AREA_COLOR = '#e8b339';

/** Pixels reserved on the left of the container for axis labels. The chart's
 *  data plot starts at this pixel offset so cooldown rows below align here. */
export const CHART_DATA_PLOT_LEFT_OFFSET = 45;

export const DamageDoneChart = memo(
  ({
    buffWindows,
    width,
    onHover,
  }: {
    buffWindows: BuffWindow[];
    width: number;
    onHover?: SignalListener;
  }) => {
    const events = useEvents();
    const info = useInfo();
    const { fight } = useFight();
    const { report } = useReport();
    const { events: bossPhaseEvents } = useBossPhaseEvents({ report, fight });

    if (!info || !fight || !report || !bossPhaseEvents) {
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
      color: w.color,
    }));

    const phaseData: { startTime: number; endTime: number; name: string }[] = [];
    let phaseStart: (typeof bossPhaseEvents)[number] | undefined;
    for (const event of bossPhaseEvents) {
      if (event.type === EventType.PhaseStart) {
        phaseStart = event;
      } else if (phaseStart && event.type === EventType.PhaseEnd) {
        phaseData.push({
          startTime: phaseStart.timestamp - info.fightStart,
          endTime: event.timestamp - info.fightStart,
          name: phaseStart.phase.name.split(':')[0],
        });
        phaseStart = undefined;
      }
    }

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
              title: 'DPS',
              type: 'quantitative',
              axis: { format: '~s', grid: false },
              scale: { zero: true },
            },
          },
        },
      ],
    };

    const chartWidth = width - CHART_DATA_PLOT_LEFT_OFFSET;

    return (
      <div style={{ width }}>
        {phaseData.length > 0 && (
          <div
            style={{ position: 'relative', height: 28, marginLeft: CHART_DATA_PLOT_LEFT_OFFSET }}
          >
            {phaseData.map(({ startTime, endTime, name }) => (
              <Tooltip
                key={startTime}
                content={
                  <>
                    {name}
                    {' @ '}
                    {formatDuration(startTime)}
                    {' - '}
                    {formatDuration(endTime)}
                  </>
                }
              >
                <div
                  style={{
                    position: 'absolute',
                    left: `${(startTime / info.fightDuration) * 100}%`,
                    width: `${((endTime - startTime) / info.fightDuration) * 100}%`,
                    height: 24,
                    background: '#201d15',
                    border: '1px solid black',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    cursor: 'default',
                  }}
                >
                  <span
                    style={{
                      color: '#f3eded',
                      fontSize: 10,
                      pointerEvents: 'none',
                      userSelect: 'none',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      minWidth: 0,
                      width: '100%',
                      textAlign: 'center',
                      padding: '0 4px',
                    }}
                  >
                    {name}
                  </span>
                </div>
              </Tooltip>
            ))}
          </div>
        )}
        <div style={{ display: 'grid', justifyItems: 'end' }}>
          <BaseChart
            data={data}
            width={chartWidth}
            height={200}
            spec={spec}
            config={{ ...defaultConfig, autosize: { type: 'pad', contains: 'content' } }}
            signalListeners={onHover ? { hover: onHover } : undefined}
          />
        </div>
      </div>
    );
  },
);
