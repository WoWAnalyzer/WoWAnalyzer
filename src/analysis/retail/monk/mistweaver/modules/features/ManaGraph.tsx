import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { Talent } from 'common/TALENTS/types';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import ManaValues from 'parser/shared/modules/ManaValues';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';
import { SPELL_COLORS } from '../../constants';
import ManaTea from '../spells/ManaTea';
import InvokeChiJi from '../spells/InvokeChiJi';
import InvokeYulon from '../spells/InvokeYulon';
import { MANA_GRAPH_CONFIG } from './manaGraphConfig';

const MANA_TEA = 'Mana Tea';
const MANA_TEA_WASTED = 'Mana Tea (mana wasted)';

interface Window {
  start: number;
  end: number;
}

interface CooldownCast {
  timestamp: number;
  series: string;
}

const COOLDOWNS = [
  {
    talent: TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT,
    color: SPELL_COLORS.YULON,
  },
  {
    talent: TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT,
    color: SPELL_COLORS.CHI_JI,
  },
];

class ManaGraph extends Analyzer.withDependencies({
  manaValues: ManaValues,
  manaTea: ManaTea,
}) {
  innervateWindows: Window[] = [];
  innervateStart = -1;
  unityWindows: Window[] = [];
  unityStart = -1;
  cooldownCasts: CooldownCast[] = [];
  cooldowns: { talent: Talent; color: string }[];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.MANA_TEA_TALENT);
    this.cooldowns = COOLDOWNS.filter(({ talent }) => this.selectedCombatant.hasTalent(talent));
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.INNERVATE),
      this.onInnervateApply,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.INNERVATE),
      this.onInnervateRemove,
    );
    if (this.cooldowns.length > 0) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(this.cooldowns.map(({ talent }) => talent)),
        this.onCooldownCast,
      );
    }
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onInnervateApply(event: ApplyBuffEvent) {
    this.innervateStart = event.timestamp;
  }

  onInnervateRemove(event: RemoveBuffEvent) {
    // the buff can be up before the fight starts
    const start = this.innervateStart === -1 ? this.owner.fight.start_time : this.innervateStart;
    this.innervateWindows.push({ start, end: event.timestamp });
    this.innervateStart = -1;
  }

  onUnityApply(event: ApplyBuffEvent) {
    this.unityStart = event.timestamp;
  }

  onUnityRemove(event: RemoveBuffEvent) {
    const start = this.unityStart === -1 ? this.owner.fight.start_time : this.unityStart;
    this.unityWindows.push({ start, end: event.timestamp });
    this.unityStart = -1;
  }

  onCooldownCast(event: CastEvent) {
    const cooldown = this.cooldowns.find(({ talent }) => talent.id === event.ability.guid);
    if (cooldown) {
      this.cooldownCasts.push({ timestamp: event.timestamp, series: cooldown.talent.name });
    }
  }

  onFightEnd() {
    if (this.innervateStart !== -1) {
      this.innervateWindows.push({ start: this.innervateStart, end: this.owner.fight.end_time });
      this.innervateStart = -1;
    }
    if (this.unityStart !== -1) {
      this.unityWindows.push({ start: this.unityStart, end: this.owner.fight.end_time });
      this.unityStart = -1;
    }
  }

  private shift(timestamp: number) {
    return timestamp - this.owner.fight.start_time;
  }

  private manaPercentAt(timestamp: number) {
    const update = this.deps.manaValues.manaUpdates.findLast((u) => u.timestamp <= timestamp);
    return update ? (update.current / update.max) * 100 : 100;
  }

  private get cooldownWindows() {
    const celestials = [
      [
        TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT,
        this.owner.getOptionalModule(InvokeYulon),
      ],
      [TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT, this.owner.getOptionalModule(InvokeChiJi)],
    ] as const;
    const windows: (Window & { series: string })[] = [];
    celestials.forEach(([talent, module]) => {
      module?.celestialWindows.forEach((end, start) => {
        windows.push({ start, end, series: talent.name });
      });
    });
    return windows;
  }

  private windowData({ start, end }: Window) {
    return {
      start: this.shift(start),
      end: this.shift(end),
      from: formatDuration(this.shift(start)),
      until: formatDuration(this.shift(end)),
    };
  }

  get plot() {
    const xAxis = {
      field: 'x',
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
    const yAxis = {
      field: 'mana',
      type: 'quantitative' as const,
      title: 'Mana %',
      scale: { domain: [0, 100] },
      axis: { grid: false },
    };

    const manaTeaCasts = this.deps.manaTea.castTrackers.map((cast) => ({
      x: this.shift(cast.timestamp),
      mana: this.manaPercentAt(cast.timestamp),
      series: cast.manaWasted > 0 ? MANA_TEA_WASTED : MANA_TEA,
      // the restored amount includes anything that was wasted
      gained: formatNumber(cast.manaRestored - cast.manaWasted),
      wasted: formatNumber(cast.manaWasted),
    }));
    // only list the wasted entry in the legend if some channel actually wasted mana
    const manaTeaSeries = manaTeaCasts.some((cast) => cast.series === MANA_TEA_WASTED)
      ? [MANA_TEA, MANA_TEA_WASTED]
      : [MANA_TEA];
    const manaTeaColors = ['#2f7d7a', '#e5484d'].slice(0, manaTeaSeries.length);

    const cooldownScale = {
      domain: this.cooldowns.map(({ talent }) => talent.name),
      range: this.cooldowns.map(({ color }) => color),
    };

    const spec: VisualizationSpec = {
      data: {
        name: 'manaPoints',
      },
      encoding: {
        x: xAxis,
      },
      layer: [
        {
          mark: {
            type: 'area' as const,
            line: {
              color: '#026dd7',
              strokeWidth: 1,
            },
            color: 'rgba(2, 109, 215, .15)',
          },
          encoding: {
            y: yAxis,
            tooltip: [
              { field: 'mana', type: 'quantitative' as const, title: 'Mana %', format: '.0f' },
            ],
          },
        },
        {
          data: {
            name: 'innervateWindows',
          },
          mark: {
            type: 'rect' as const,
            color: '#a86cf0',
            opacity: 0.25,
          },
          encoding: {
            x: { field: 'start', type: 'quantitative' as const },
            x2: { field: 'end' },
            tooltip: [
              { field: 'from', type: 'nominal' as const, title: 'Innervate from' },
              { field: 'until', type: 'nominal' as const, title: 'Until' },
            ],
          },
        },
        ...(this.cooldowns.length > 0
          ? [
              {
                data: {
                  name: 'cooldownWindows',
                },
                mark: {
                  type: 'rect' as const,
                  opacity: 0.2,
                },
                encoding: {
                  x: { field: 'start', type: 'quantitative' as const },
                  x2: { field: 'end' },
                  color: {
                    field: 'series',
                    type: 'nominal' as const,
                    scale: cooldownScale,
                    legend: null,
                  },
                  tooltip: [
                    { field: 'series', type: 'nominal' as const, title: 'Active' },
                    { field: 'from', type: 'nominal' as const, title: 'From' },
                    { field: 'until', type: 'nominal' as const, title: 'Until' },
                  ],
                },
              },
            ]
          : []),
        {
          data: {
            name: 'manaTeaCasts',
          },
          mark: {
            type: 'point' as const,
            shape: 'diamond',
            filled: true,
            size: 120,
            stroke: '#000000',
            strokeWidth: 0.5,
          },
          encoding: {
            x: xAxis,
            y: yAxis,
            color: {
              field: 'series',
              type: 'nominal' as const,
              scale: {
                domain: manaTeaSeries,
                range: manaTeaColors,
              },
              legend: { title: null },
            },
            tooltip: [
              { field: 'series', type: 'nominal' as const, title: 'Cast' },
              { field: 'gained', type: 'nominal' as const, title: 'Mana gained' },
              { field: 'wasted', type: 'nominal' as const, title: 'Mana wasted' },
            ],
          },
        },
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
                manaPoints: this.deps.manaValues.manaUpdates.map((update) => ({
                  x: this.shift(update.timestamp),
                  mana: (update.current / update.max) * 100,
                })),
                innervateWindows: this.innervateWindows.map((window) => this.windowData(window)),
                cooldownWindows: this.cooldownWindows.map((window) => ({
                  ...this.windowData(window),
                  series: window.series,
                })),
                cooldownCasts: this.cooldownCasts.map((cast) => ({
                  x: this.shift(cast.timestamp),
                  mana: this.manaPercentAt(cast.timestamp),
                  series: cast.series,
                })),
                manaTeaCasts,
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

export default ManaGraph;
