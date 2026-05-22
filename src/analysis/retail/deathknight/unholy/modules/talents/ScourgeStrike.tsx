import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VisualizationSpec } from 'react-vega';
import type { CSSProperties, JSX } from 'react';

const LEGEND_DOT_BASE_STYLE: CSSProperties = {
  display: 'inline-block',
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  marginRight: '6px',
};

const GOOD_CAST_COLOR = '#22c55e';
const BAD_CAST_COLOR = '#ef4444';
const STACK_LINE_COLOR = '#5dd7fc';

type StackTimelinePoint = {
  timestamp: number;
  stacks: number;
};

type CastTimelinePoint = {
  timestamp: number;
  stacks: number;
  bad: boolean;
};

type EfficiencySummary = {
  good: number;
  total: number;
};

class ScourgeStrike extends Analyzer {
  private castsWithLesserGhoulStacks = 0;
  private castsWithoutLesserGhoulStacks = 0;

  private readonly lesserGhoulStackTimeline: StackTimelinePoint[] = [];
  private readonly scourgeStrikeCastTimeline: CastTimelinePoint[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.SCOURGE_STRIKE_TALENT);
    if (!this.active) {
      return;
    }

    this.recordLesserGhoulStacks(this.owner.fight.start_time, 0);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.LESSER_GHOUL_BUFF),
      this.onLesserGhoulApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.LESSER_GHOUL_BUFF),
      this.onLesserGhoulApplyBuffStack,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.LESSER_GHOUL_BUFF),
      this.onLesserGhoulRemoveBuffStack,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.LESSER_GHOUL_BUFF),
      this.onLesserGhoulRemoveBuff,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SCOURGE_STRIKE_TALENT),
      this.onScourgeStrikeCast,
    );
  }

  private onLesserGhoulApplyBuff(event: ApplyBuffEvent) {
    this.recordLesserGhoulStacks(event.timestamp, 1);
  }

  private onLesserGhoulApplyBuffStack(event: ApplyBuffStackEvent) {
    this.recordLesserGhoulStacks(event.timestamp, event.stack);
  }

  private onLesserGhoulRemoveBuffStack(event: RemoveBuffStackEvent) {
    this.recordLesserGhoulStacks(event.timestamp, event.stack);
  }

  private onLesserGhoulRemoveBuff(event: RemoveBuffEvent) {
    this.recordLesserGhoulStacks(event.timestamp, 0);
  }

  private recordLesserGhoulStacks(timestamp: number, stacks: number) {
    const previousPoint = this.lesserGhoulStackTimeline[this.lesserGhoulStackTimeline.length - 1];

    if (previousPoint?.timestamp === timestamp) {
      previousPoint.stacks = stacks;
      return;
    }

    this.lesserGhoulStackTimeline.push({ timestamp, stacks });
  }

  private onScourgeStrikeCast(event: CastEvent) {
    const lesserGhoulStacks = this.selectedCombatant.getBuffStacks(
      SPELLS.LESSER_GHOUL_BUFF.id,
      event.timestamp,
    );

    this.scourgeStrikeCastTimeline.push({
      timestamp: event.timestamp,
      stacks: lesserGhoulStacks,
      bad: lesserGhoulStacks === 0,
    });

    if (lesserGhoulStacks > 0) {
      this.castsWithLesserGhoulStacks += 1;
      return;
    }

    this.castsWithoutLesserGhoulStacks += 1;
  }

  get totalScourgeStrikeCasts(): number {
    return this.castsWithLesserGhoulStacks + this.castsWithoutLesserGhoulStacks;
  }

  get efficiency(): number {
    return this.totalScourgeStrikeCasts > 0
      ? this.castsWithLesserGhoulStacks / this.totalScourgeStrikeCasts
      : 1;
  }

  get efficiencySummary(): EfficiencySummary {
    return {
      good: this.castsWithLesserGhoulStacks,
      total: this.totalScourgeStrikeCasts,
    };
  }

  private get chartData() {
    const goodCastData: Array<{ timestamp: number; stacks: number; outcome: string }> = [];
    const badCastData: Array<{ timestamp: number; stacks: number; outcome: string }> = [];

    this.scourgeStrikeCastTimeline.forEach((cast) => {
      const castPoint = {
        timestamp: cast.timestamp,
        stacks: cast.stacks,
        outcome: cast.bad ? 'Bad cast' : 'Good cast',
      };

      if (cast.bad) {
        badCastData.push(castPoint);
        return;
      }

      goodCastData.push(castPoint);
    });

    const stackData = [...this.lesserGhoulStackTimeline];
    const lastStackPoint = stackData[stackData.length - 1];
    const fightEnd = this.owner.fight.end_time;

    if (lastStackPoint && lastStackPoint.timestamp < fightEnd) {
      stackData.push({ timestamp: fightEnd, stacks: lastStackPoint.stacks });
    }

    return {
      stackData,
      goodCastData,
      badCastData,
    };
  }

  private get chartSpec(): VisualizationSpec {
    const normalizeTimeTransform = {
      calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
      as: 'timestamp_shifted',
    };

    const tooltipTimeTransform = {
      calculate: formatTime('datum.timestamp_shifted'),
      as: 'timestamp_humanized',
    };

    return {
      encoding: {
        x: {
          field: 'timestamp_shifted',
          type: 'quantitative',
          axis: {
            labelExpr: formatTime('datum.value'),
            tickCount: 20,
            grid: false,
          },
          scale: {
            nice: false,
          },
          title: null,
        },
      },
      layer: [
        {
          data: { name: 'stackData' },
          transform: [normalizeTimeTransform, tooltipTimeTransform],
          mark: {
            type: 'line',
            interpolate: 'step-after',
            color: STACK_LINE_COLOR,
          },
          encoding: {
            y: {
              field: 'stacks',
              type: 'quantitative',
              title: 'Lesser Ghoul stacks',
              axis: {
                grid: true,
              },
            },
            tooltip: [
              { field: 'timestamp_humanized', type: 'nominal', title: 'Time' },
              { field: 'stacks', type: 'quantitative', title: 'Stacks' },
            ],
          },
        },
        {
          data: { name: 'goodCastData' },
          transform: [normalizeTimeTransform, tooltipTimeTransform],
          mark: {
            type: 'point',
            filled: true,
            color: GOOD_CAST_COLOR,
            size: 55,
          },
          encoding: {
            y: {
              field: 'stacks',
              type: 'quantitative',
            },
            tooltip: [
              { field: 'timestamp_humanized', type: 'nominal', title: 'Time' },
              { field: 'outcome', type: 'nominal', title: 'Scourge Strike' },
              { field: 'stacks', type: 'quantitative', title: 'Stacks at cast' },
            ],
          },
        },
        {
          data: { name: 'badCastData' },
          transform: [normalizeTimeTransform, tooltipTimeTransform],
          mark: {
            type: 'point',
            shape: 'diamond',
            filled: true,
            color: BAD_CAST_COLOR,
            size: 110,
          },
          encoding: {
            y: {
              field: 'stacks',
              type: 'quantitative',
            },
            tooltip: [
              { field: 'timestamp_humanized', type: 'nominal', title: 'Time' },
              { field: 'outcome', type: 'nominal', title: 'Scourge Strike' },
              { field: 'stacks', type: 'quantitative', title: 'Stacks at cast' },
            ],
          },
        },
      ],
      config: {
        view: {},
      },
    };
  }

  private get breakdownItems() {
    return [
      {
        color: GOOD_CAST_COLOR,
        label: <SpellLink spell={SPELLS.LESSER_GHOUL_BUFF}>With Lesser Ghoul stacks</SpellLink>,
        value: this.castsWithLesserGhoulStacks,
        valuePercent: false,
        valueTooltip: (
          <>
            {this.castsWithLesserGhoulStacks} <SpellLink spell={TALENTS.SCOURGE_STRIKE_TALENT} />{' '}
            casts with <SpellLink spell={SPELLS.LESSER_GHOUL_BUFF} /> stacks
          </>
        ),
      },
      {
        color: BAD_CAST_COLOR,
        label: <SpellLink spell={SPELLS.LESSER_GHOUL_BUFF}>Without Lesser Ghoul stacks</SpellLink>,
        value: this.castsWithoutLesserGhoulStacks,
        valuePercent: false,
        valueTooltip: (
          <>
            {this.castsWithoutLesserGhoulStacks} <SpellLink spell={TALENTS.SCOURGE_STRIKE_TALENT} />{' '}
            casts without <SpellLink spell={SPELLS.LESSER_GHOUL_BUFF} /> stacks
          </>
        ),
      },
    ];
  }

  private renderEfficiencySummary({
    rowStyle,
    showBreakdown = true,
  }: {
    rowStyle?: CSSProperties;
    showBreakdown?: boolean;
  }) {
    const { good, total } = this.efficiencySummary;

    return (
      <>
        <div style={rowStyle}>
          <strong>{formatPercentage(this.efficiency, 0)}%</strong> <small>efficiency</small>
        </div>
        {showBreakdown && (
          <div style={rowStyle}>
            <strong>
              {good} / {total}
            </strong>{' '}
            <small>good / total</small>
          </div>
        )}
      </>
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS.SCOURGE_STRIKE_TALENT} />
        </strong>{' '}
        should be used while you have <SpellLink spell={SPELLS.LESSER_GHOUL_BUFF} /> stacks
        available. Casting without stacks misses out on stack consumption value, so your goal is
        100% of casts with at least one stack active.
      </p>
    );

    const data = (
      <div>
        <div style={{ marginBottom: '6px' }}>
          <strong>
            <SpellLink spell={TALENTS.SCOURGE_STRIKE_TALENT} /> usage
          </strong>
        </div>
        {this.renderEfficiencySummary({ rowStyle: { marginBottom: '8px' } })}
        <p style={{ margin: '0 0 8px 0' }}>
          Use <SpellLink spell={TALENTS.SCOURGE_STRIKE_TALENT} /> while{' '}
          <SpellLink spell={SPELLS.LESSER_GHOUL_BUFF} /> is stacked.
        </p>
        <small style={{ display: 'grid', gap: '2px', marginBottom: '6px' }}>
          <span>
            <span
              style={{
                ...LEGEND_DOT_BASE_STYLE,
                backgroundColor: GOOD_CAST_COLOR,
              }}
            />
            With <SpellLink spell={SPELLS.LESSER_GHOUL_BUFF} /> stacks
          </span>
          <span>
            <span
              style={{
                ...LEGEND_DOT_BASE_STYLE,
                backgroundColor: BAD_CAST_COLOR,
              }}
            />
            Without <SpellLink spell={SPELLS.LESSER_GHOUL_BUFF} /> stacks
          </span>
        </small>
        <div style={{ minHeight: '180px', marginBottom: '8px' }}>
          <AutoSizer disableHeight>
            {({ width }) => (
              <BaseChart width={width} height={180} spec={this.chartSpec} data={this.chartData} />
            )}
          </AutoSizer>
        </div>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, 40);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(14)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <BoringSpellValueText spell={TALENTS.SCOURGE_STRIKE_TALENT}>
          {this.renderEfficiencySummary({ showBreakdown: false })}
        </BoringSpellValueText>
        <div style={{ padding: '8px' }}>
          <DonutChart items={this.breakdownItems} />
        </div>
      </Statistic>
    );
  }
}

export default ScourgeStrike;
