import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  HealEvent,
} from 'parser/core/Events';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber } from 'common/format';
import { SpellLink } from 'interface';
import { RESTORATION_COLORS, healingIncreases } from 'analysis/retail/shaman/restoration/constants';
import BaseChart, { formatTime } from 'parser/ui/BaseChart';
import { VisualizationSpec } from 'react-vega';
import AutoSizer from 'react-virtualized-auto-sizer';

interface StackTracker {
  timestamp: number;
  stacks: number;
}

interface CastTracker {
  timestamp: number;
  stacks: number;
}

export default class CoalescingWater extends Analyzer {
  // Healing stats
  healingDoneFromTalent = 0;
  overhealingDoneFromTalent = 0;

  // Tracking metrics
  generatedByHW = 0;
  generatedByCH = 0;
  consumedTotal = 0;
  wastedOvercapped = 0;

  // Graph data
  stackChanges: StackTracker[] = [];
  riptideCasts: CastTracker[] = [];

  // State management
  lastCastTimestamp = -1;
  lastStackTimestamp = -1;
  currentStacks = 0;
  pendingStacks = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.COALESCING_WATER_TALENT);
    if (!this.active) {
      return;
    }

    this.stackChanges.push({ timestamp: this.owner.fight.start_time, stacks: 0 });
    this.lastStackTimestamp = this.owner.fight.start_time;

    // Healing calculation
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS.RIPTIDE_TALENT),
      this.onRiptideHeal,
    );

    // Buff stack tracking for graph
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.COALESCING_WATER_BUFF),
      this.onBuffApplied,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.COALESCING_WATER_BUFF),
      this.onStackGained,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.COALESCING_WATER_BUFF),
      this.onStackLost,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.COALESCING_WATER_BUFF),
      this.onBuffRemoved,
    );

    // Track Generators and Consumers
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HEALING_WAVE),
      this.onHealingWaveCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.CHAIN_HEAL_TALENT),
      this.onChainHealCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.RIPTIDE_TALENT),
      this.onRiptideCast,
    );

    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private get currentBuffStacks(): number {
    return this.selectedCombatant.getBuff(SPELLS.COALESCING_WATER_BUFF)?.stacks ?? 0;
  }

  private advanceStackTimestamp(newTimestamp: number) {
    if (newTimestamp !== this.lastStackTimestamp) {
      this.registerStackChange();
    }
    this.lastStackTimestamp = newTimestamp;
  }

  private registerStackChange() {
    this.currentStacks = this.pendingStacks;
    this.stackChanges.push({
      timestamp: this.lastStackTimestamp,
      stacks: this.currentStacks,
    });
  }

  onBuffApplied = (event: ApplyBuffEvent) => {
    this.advanceStackTimestamp(event.timestamp);
    this.pendingStacks = 1;
  };

  onStackGained = (event: ApplyBuffStackEvent) => {
    this.advanceStackTimestamp(event.timestamp);
    this.pendingStacks += 1;
  };

  onStackLost = (event: RemoveBuffStackEvent) => {
    this.advanceStackTimestamp(event.timestamp);
    this.pendingStacks -= 1;
  };

  onBuffRemoved = (event: RemoveBuffEvent) => {
    this.advanceStackTimestamp(event.timestamp);
    this.pendingStacks = 0;
  };

  onHealingWaveCast = (event: CastEvent) => {
    if (this.currentBuffStacks >= 2) {
      this.wastedOvercapped++;
    } else {
      this.generatedByHW++;
    }
  };

  onChainHealCast = (event: CastEvent) => {
    if (this.currentBuffStacks >= 2) {
      this.wastedOvercapped++;
    } else {
      this.generatedByCH++;
    }
  };

  onRiptideCast = (event: CastEvent) => {
    const stacks = this.currentBuffStacks;
    if (stacks > 0) {
      this.consumedTotal += stacks;
    }

    this.lastCastTimestamp = event.timestamp;
    this.riptideCasts.push({
      timestamp: event.timestamp,
      stacks: this.currentStacks, // Fallback to tracked stacks for the graph to prevent visual desyncs
    });
  };

  onFightEnd = () => {
    this.registerStackChange();
  };

  onRiptideHeal = (event: HealEvent) => {
    // ignore HoT aspect of riptide
    if (event.tick) {
      return;
    }
    // ignore unbuffed riptide casts
    if (!this.selectedCombatant.hasBuff(SPELLS.COALESCING_WATER_BUFF)) {
      return;
    }

    const coalescingWaterStacks =
      this.selectedCombatant.getBuff(SPELLS.COALESCING_WATER_BUFF)?.stacks ?? 0;
    const talentBuff = coalescingWaterStacks * healingIncreases.COALESCING_WATER_HEALING_INCREASE;
    this.healingDoneFromTalent += calculateEffectiveHealing(event, talentBuff);

    this.overhealingDoneFromTalent += calculateOverhealing(event, talentBuff);
  };

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <strong>{formatNumber(this.healingDoneFromTalent)}</strong> bonus healing (
            {formatNumber(this.overhealingDoneFromTalent)} overhealing)
          </>
        }
      >
        <TalentSpellText talent={TALENTS.COALESCING_WATER_TALENT}>
          <div>
            <ItemHealingDone amount={this.healingDoneFromTalent} />{' '}
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }

  get plot() {
    const xAxis = {
      field: 'timestamp_shifted',
      type: 'quantitative' as const,
      axis: {
        labelExpr: formatTime('datum.value'),
        tickCount: 30,
        grid: false,
      },
      scale: {
        nice: false,
      },
      title: 'Time',
    };

    const spec: VisualizationSpec = {
      data: { name: 'stackChanges' },
      transform: [
        { filter: 'isValid(datum.stacks)' },
        {
          calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
          as: 'timestamp_shifted',
        },
      ],
      encoding: { x: xAxis },
      layer: [
        {
          mark: {
            type: 'area' as const,
            interpolate: 'step-after' as const,
            line: { color: RESTORATION_COLORS.HEALING_RAIN, strokeWidth: 0.75 },
            color: RESTORATION_COLORS.CHAIN_HEAL,
          },
          encoding: {
            y: {
              field: 'stacks',
              type: 'quantitative' as const,
              title: 'Stacks',
              axis: { grid: false, format: '~s', tickCount: 2 },
            },
            tooltip: [{ field: 'stacks', type: 'quantitative' as const, title: 'Stacks' }],
          },
        },
        {
          data: { name: 'riptideCasts' },
          transform: [
            {
              calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
              as: 'timestamp_shifted',
            },
            { calculate: `'Riptide cast'`, as: 'series' },
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
            y: { field: 'stacks', type: 'quantitative' as const, title: 'Stacks' },
            color: {
              field: 'series',
              type: 'nominal' as const,
              scale: {
                domain: ['Riptide cast'],
                range: [RESTORATION_COLORS.RIPTIDE],
              },
              legend: { title: 'Events', orient: 'left' as const },
            },
            tooltip: [
              { field: 'stacks', type: 'quantitative' as const, title: 'Stacks at Riptide cast' },
            ],
          },
        },
      ],
      config: {
        axis: { titleFontWeight: 'normal', titleFontSize: 14 },
        axisY: { titleAngle: 360, titlePadding: 40 },
        legend: {
          orient: 'left' as const,
          titleFontSize: 13,
          labelFontSize: 12,
          symbolSize: 100,
          padding: 8,
        },
      },
    };

    return (
      <div className="graph-container" style={{ width: '100%', minHeight: 200 }}>
        <AutoSizer>
          {({ width, height }) => (
            <BaseChart
              spec={spec}
              data={{
                stackChanges: this.stackChanges,
                riptideCasts: this.riptideCasts,
              }}
              width={width}
              height={height}
            />
          )}
        </AutoSizer>
      </div>
    );
  }

  get guideSubsection() {
    const totalGenerated = this.generatedByHW + this.generatedByCH;

    return (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS.COALESCING_WATER_TALENT} />
          </strong>{' '}
          increases the initial healing of your next <SpellLink spell={TALENTS.RIPTIDE_TALENT} />.
          It is generated by casting <SpellLink spell={SPELLS.HEALING_WAVE} /> and{' '}
          <SpellLink spell={TALENTS.CHAIN_HEAL_TALENT} />, and stacks up to 2 times.
        </p>

        <ul>
          <li>
            <strong>Stacks Generated:</strong> {totalGenerated} ({this.generatedByHW} from Healing
            Wave, {this.generatedByCH} from Chain Heal)
          </li>
          <li>
            <strong>Stacks Consumed:</strong> {this.consumedTotal} (used on Riptide)
          </li>
          <li>
            <strong>Stacks Wasted (Overcapped):</strong>{' '}
            <span className={this.wastedOvercapped > 0 ? 'text-danger' : 'text-success'}>
              {this.wastedOvercapped}
            </span>
          </li>
        </ul>

        <p>
          Try to avoid casting Healing Wave or Chain Heal when you are already sitting at 2 stacks
          of Coalescing Water to prevent wasting the buff. Below is a graph showing your stacks over
          time and when you consumed them with Riptide (blue diamonds):
        </p>

        <div style={{ marginTop: 15 }}>{this.plot}</div>
      </>
    );
  }
}
