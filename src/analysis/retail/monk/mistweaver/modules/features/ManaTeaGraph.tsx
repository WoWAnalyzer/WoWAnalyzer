import { formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import { MANA_GRAPH_CONFIG } from './manaGraphConfig';
import AutoSizer from 'react-virtualized-auto-sizer';
import {
  MANA_TEA_MAX_STACKS,
  REFRESHMENT_MANA_TEA_STACKS,
  REFRESHMENT_WINDOW_MS,
  SPELL_COLORS,
  getCurrentRSKTalent,
} from '../../constants';
import { HasStackChange, didLifecyclesGainStack } from '../../normalizers/CastLinkNormalizer';

// natural stacks can land on the same timestamp as the cast, refreshment's land at least 1ms after
const REFRESHMENT_MIN_DELAY_MS = 1;

interface StackTracker {
  timestamp: number;
  stacks: number;
}

interface LifecyclesTracker extends StackTracker {
  series: string;
  buff: string;
}

const LIFECYCLES_GAINED = 'Lifecycles (stack gained)';
const LIFECYCLES_WASTED_AT_MAX = 'Lifecycles (wasted at max stacks)';
const LIFECYCLES_WASTED_OTHER = 'Lifecycles (refreshed/expired)';

class ManaTeaGraph extends Analyzer {
  stackChanges: StackTracker[] = [];
  lifeCocoonCasts: StackTracker[] = [];
  lifecyclesConsumptions: LifecyclesTracker[] = [];
  // the lifecycles buffs are named after the spell that consumes them
  lifecyclesVivifyName: string;
  lifecyclesKickName: string;
  hasRefreshment: boolean;
  hasLifecycles: boolean;

  currentStacks = 0;
  stacksGained = 0;
  capWindows: { start: number; end: number }[] = [];
  capStart = -1;
  refreshmentGained = 0;
  refreshmentWasted = 0;
  lastLifeCocoon = Number.MIN_SAFE_INTEGER;
  refreshmentHandled = true;
  // the events that belong to refreshment, so other modules don't count them as another source
  refreshmentEvents = new Set<ApplyBuffEvent | ApplyBuffStackEvent | RefreshBuffEvent>();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.MANA_TEA_TALENT);
    this.hasRefreshment = this.selectedCombatant.hasTalent(TALENTS_MONK.REFRESHMENT_TALENT);
    this.hasLifecycles = this.selectedCombatant.hasTalent(TALENTS_MONK.LIFECYCLES_TALENT);
    this.lifecyclesVivifyName = this.selectedCombatant.hasTalent(TALENTS_MONK.SHEILUNS_GIFT_TALENT)
      ? TALENTS_MONK.SHEILUNS_GIFT_TALENT.name
      : SPELLS.VIVIFY.name;
    this.lifecyclesKickName = `${getCurrentRSKTalent(this.selectedCombatant).name} / ${TALENTS_MONK.ENVELOPING_MIST_TALENT.name}`;
    this.stackChanges.push({ timestamp: this.owner.fight.start_time, stacks: 0 });

    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_STACK),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_STACK),
      this.onStackGain,
    );
    this.addEventListener(
      Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_STACK),
      this.onStackLoss,
    );
    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_STACK),
      this.onRefresh,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.MANA_TEA_STACK),
      this.onRemoveBuff,
    );
    if (this.hasRefreshment) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.LIFE_COCOON_TALENT),
        this.onLifeCocoon,
      );
    }
    if (this.hasLifecycles) {
      const lifecyclesBuffs = [
        SPELLS.LIFECYCLES_ENVELOPING_MIST_BUFF,
        SPELLS.LIFECYCLES_VIVIFY_BUFF,
      ];
      this.addEventListener(
        Events.removebuff.by(SELECTED_PLAYER).spell(lifecyclesBuffs),
        this.onLifecyclesConsumed,
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(lifecyclesBuffs),
        this.onLifecyclesConsumed,
      );
    }
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  // a lifecycles buff without a gained mana tea stack didn't give us anything
  onLifecyclesConsumed(event: RemoveBuffEvent | RefreshBuffEvent) {
    let series = LIFECYCLES_GAINED;
    if (!didLifecyclesGainStack(event)) {
      series =
        this.currentStacks >= MANA_TEA_MAX_STACKS
          ? LIFECYCLES_WASTED_AT_MAX
          : LIFECYCLES_WASTED_OTHER;
    }
    this.lifecyclesConsumptions.push({
      timestamp: event.timestamp,
      stacks: this.currentStacks,
      series,
      buff:
        event.ability.guid === SPELLS.LIFECYCLES_VIVIFY_BUFF.id
          ? this.lifecyclesVivifyName
          : this.lifecyclesKickName,
    });
  }

  private setStacks(timestamp: number, stacks: number) {
    // step the line instead of drawing a slope between changes
    this.stackChanges.push({ timestamp, stacks: this.currentStacks });
    this.stacksGained += Math.max(0, stacks - this.currentStacks);
    this.trackCap(timestamp, stacks);
    this.currentStacks = stacks;
    this.stackChanges.push({ timestamp, stacks });
  }

  // time spent at the cap is time where new stacks are wasted
  private trackCap(timestamp: number, stacks: number) {
    if (stacks >= MANA_TEA_MAX_STACKS && this.capStart === -1) {
      this.capStart = timestamp;
    } else if (stacks < MANA_TEA_MAX_STACKS && this.capStart !== -1) {
      this.capWindows.push({ start: this.capStart, end: timestamp });
      this.capStart = -1;
    }
  }

  get timeAtCap() {
    return this.capWindows.reduce((total, { start, end }) => total + (end - start), 0);
  }

  isRefreshmentGain(timestamp: number) {
    const delay = timestamp - this.lastLifeCocoon;
    return (
      !this.refreshmentHandled &&
      delay >= REFRESHMENT_MIN_DELAY_MS &&
      delay <= REFRESHMENT_WINDOW_MS
    );
  }

  isRefreshmentEvent(event: ApplyBuffEvent | ApplyBuffStackEvent | RefreshBuffEvent) {
    return this.refreshmentEvents.has(event);
  }

  // the first gain shortly after a life cocoon cast is refreshment's
  private trackRefreshment(
    event: ApplyBuffEvent | ApplyBuffStackEvent | RefreshBuffEvent,
    gained: number,
  ) {
    const used = Math.max(0, Math.min(gained, REFRESHMENT_MANA_TEA_STACKS));
    this.refreshmentGained += used;
    this.refreshmentWasted += REFRESHMENT_MANA_TEA_STACKS - used;
    this.refreshmentHandled = true;
    this.refreshmentEvents.add(event);
  }

  onApplyBuff(event: ApplyBuffEvent) {
    // a fresh apply is logged without a stack count, but refreshment grants several at once
    const fromRefreshment = this.isRefreshmentGain(event.timestamp);
    if (fromRefreshment) {
      this.trackRefreshment(event, REFRESHMENT_MANA_TEA_STACKS - this.currentStacks);
    }
    this.setStacks(event.timestamp, fromRefreshment ? REFRESHMENT_MANA_TEA_STACKS : 1);
  }

  onStackGain(event: ApplyBuffStackEvent) {
    if (this.isRefreshmentGain(event.timestamp)) {
      this.trackRefreshment(event, event.stack - this.currentStacks);
    }
    this.setStacks(event.timestamp, event.stack);
  }

  onStackLoss(event: RemoveBuffStackEvent) {
    this.setStacks(event.timestamp, event.stack);
  }

  // a refresh with no stack change means nothing was gained, so all of refreshment's stacks are wasted
  onRefresh(event: RefreshBuffEvent) {
    if (
      !HasStackChange(event) &&
      this.currentStacks >= MANA_TEA_MAX_STACKS &&
      this.isRefreshmentGain(event.timestamp)
    ) {
      this.trackRefreshment(event, 0);
    }
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.setStacks(event.timestamp, 0);
  }

  onLifeCocoon(event: CastEvent) {
    this.lastLifeCocoon = event.timestamp;
    this.refreshmentHandled = false;
    this.lifeCocoonCasts.push({ timestamp: event.timestamp, stacks: this.currentStacks });
  }

  onFightEnd() {
    this.trackCap(this.owner.fight.end_time, 0);
    this.stackChanges.push({ timestamp: this.owner.fight.end_time, stacks: this.currentStacks });
  }

  get plot() {
    const xAxis = {
      field: 'timestamp_shifted',
      type: 'quantitative' as const,
      axis: {
        labelExpr: formatTime('datum.value'),
        tickCount: 25,
        grid: false,
      },
      scale: {
        nice: false,
      },
      title: 'Time',
    };

    const spec: VisualizationSpec = {
      data: {
        name: 'stackChanges',
      },
      transform: [
        {
          filter: 'isValid(datum.stacks)',
        },
        {
          calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
          as: 'timestamp_shifted',
        },
      ],
      encoding: {
        x: xAxis,
      },
      layer: [
        {
          mark: {
            type: 'area' as const,
            line: {
              color: '#2f7d7a',
              strokeWidth: 1,
            },
            color: 'rgba(60, 160, 155, .15)',
          },
          encoding: {
            y: {
              field: 'stacks',
              type: 'quantitative' as const,
              title: 'Stacks',
              scale: { domain: [0, MANA_TEA_MAX_STACKS] },
              axis: {
                grid: false,
                format: '~s',
              },
            },
            tooltip: [
              {
                field: 'stacks',
                type: 'quantitative' as const,
                title: 'Mana Tea Stacks',
              },
            ],
          },
        },
        {
          data: {
            name: 'capWindows',
          },
          mark: {
            type: 'rect' as const,
            color: '#e5484d',
            opacity: 0.25,
          },
          encoding: {
            x: { field: 'start', type: 'quantitative' as const },
            x2: { field: 'end' },
            tooltip: [
              { field: 'from', type: 'nominal' as const, title: 'At cap from' },
              { field: 'until', type: 'nominal' as const, title: 'Until' },
              { field: 'duration', type: 'nominal' as const, title: 'Duration' },
            ],
          },
        },
        ...(this.hasLifecycles
          ? [
              {
                data: {
                  name: 'lifecyclesConsumptions',
                },
                transform: [
                  {
                    calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
                    as: 'timestamp_shifted',
                  },
                ],
                mark: {
                  type: 'point' as const,
                  filled: true,
                  size: 70,
                  stroke: '#000000',
                  strokeWidth: 0.5,
                },
                encoding: {
                  x: xAxis,
                  y: {
                    field: 'stacks',
                    type: 'quantitative' as const,
                    title: 'Stacks',
                  },
                  color: {
                    field: 'series',
                    type: 'nominal' as const,
                    scale: {
                      domain: [
                        LIFECYCLES_GAINED,
                        LIFECYCLES_WASTED_AT_MAX,
                        LIFECYCLES_WASTED_OTHER,
                      ],
                      range: [SPELL_COLORS.VIVIFY, '#e5484d', '#f5a623'],
                    },
                    legend: { title: null },
                  },
                  // the shape tells the two lifecycles buffs apart, the colour is what happened to it
                  shape: {
                    field: 'buff',
                    type: 'nominal' as const,
                    scale: {
                      domain: [this.lifecyclesVivifyName, this.lifecyclesKickName],
                      range: ['circle', 'square'],
                    },
                    legend: { title: null },
                  },
                  tooltip: [
                    { field: 'buff', type: 'nominal' as const, title: 'Buff' },
                    { field: 'series', type: 'nominal' as const, title: 'Consumed' },
                    { field: 'stacks', type: 'quantitative' as const, title: 'Stacks' },
                  ],
                },
              },
            ]
          : []),
        ...(this.hasRefreshment
          ? [
              {
                data: {
                  name: 'lifeCocoonCasts',
                },
                transform: [
                  {
                    calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
                    as: 'timestamp_shifted',
                  },
                ],
                mark: {
                  type: 'point' as const,
                  shape: 'diamond',
                  filled: true,
                  size: 100,
                  stroke: '#000000',
                  strokeWidth: 0.5,
                },
                encoding: {
                  x: xAxis,
                  y: {
                    field: 'stacks',
                    type: 'quantitative' as const,
                    title: 'Stacks',
                  },
                  color: { datum: 'Life Cocoon cast', value: SPELL_COLORS.LIFE_COCOON },
                  tooltip: [
                    {
                      field: 'stacks',
                      type: 'quantitative' as const,
                      title: 'Stacks before Life Cocoon',
                    },
                  ],
                },
              },
            ]
          : []),
      ],
      // each marker layer has its own colour scale, otherwise one layer's domain hides the others
      resolve: {
        scale: { color: 'independent' as const },
      },
      config: MANA_GRAPH_CONFIG,
    };

    return (
      <div
        className="graph-container"
        style={{
          width: '100%',
          minHeight: 200,
        }}
      >
        <AutoSizer>
          {({ width, height }) => (
            <BaseChart
              spec={spec}
              data={{
                stackChanges: this.stackChanges,
                lifeCocoonCasts: this.lifeCocoonCasts,
                lifecyclesConsumptions: this.lifecyclesConsumptions,
                capWindows: this.capWindows.map(({ start, end }) => ({
                  start: start - this.owner.fight.start_time,
                  end: end - this.owner.fight.start_time,
                  from: formatDuration(start - this.owner.fight.start_time),
                  until: formatDuration(end - this.owner.fight.start_time),
                  duration: formatDuration(end - start, 1),
                })),
              }}
              width={width}
              height={height}
            />
          )}
        </AutoSizer>
      </div>
    );
  }
}

export default ManaTeaGraph;
