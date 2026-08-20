import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import {
  RESTORATION_COLORS,
  TIDAL_WAVES_BUFF_MINIMAL_ACTIVE_TIME,
  fakeHaste,
} from 'analysis/retail/shaman/restoration/constants';
import Events, { BeginCastEvent, CastEvent } from 'parser/core/Events';
import { SpellLink } from 'interface';
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

export default class TidalWaves extends Analyzer {
  stackChanges: StackTracker[] = [];
  riptideCasts: CastTracker[] = [];

  generatedTotal = 0;
  consumedByHW = 0;
  consumedByCH = 0;
  wastedOvercapped = 0;

  /** Max. 2 Tidal Waves stacks, 3 with Primordial Capacity (Farseer mandatory talent) */
  maxStacks = 2;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TIDAL_WAVES_TALENT);
    if (!this.active) {
      return;
    }

    this.maxStacks = this.selectedCombatant.hasTalent(TALENTS.PRIMORDIAL_CAPACITY_TALENT) ? 3 : 2;

    this.addEventListener(
      Events.begincast.by(SELECTED_PLAYER).spell(SPELLS.HEALING_WAVE),
      this.onHealingWave,
    );
    this.addEventListener(
      Events.begincast.by(SELECTED_PLAYER).spell(TALENTS.CHAIN_HEAL_TALENT),
      this.onChainHeal,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.RIPTIDE_TALENT),
      this.onRiptideCast,
    );

    this.addEventListener(Events.fightend, this.buildStackChanges);
  }

  private get currentBuffStacks(): number {
    return this.selectedCombatant.getBuff(SPELLS.TIDAL_WAVES_BUFF.id)?.stacks ?? 0;
  }

  onHealingWave = (event: BeginCastEvent) => {
    const isInstantProc = event.castEvent && event.castEvent.timestamp === event.timestamp;
    if (event.isCancelled || isInstantProc) {
      return;
    }

    const hasTw = this.selectedCombatant.hasBuff(
      SPELLS.TIDAL_WAVES_BUFF.id,
      event.timestamp,
      0,
      TIDAL_WAVES_BUFF_MINIMAL_ACTIVE_TIME,
    );
    if (hasTw) {
      this.consumedByHW++;
    }
  };

  onChainHeal = (event: BeginCastEvent) => {
    const isInstantProc = event.castEvent && event.castEvent.timestamp === event.timestamp;
    if (event.isCancelled || isInstantProc) {
      return;
    }

    const hasTw = this.selectedCombatant.hasBuff(
      SPELLS.TIDAL_WAVES_BUFF.id,
      event.timestamp,
      0,
      TIDAL_WAVES_BUFF_MINIMAL_ACTIVE_TIME,
    );
    if (hasTw) {
      this.consumedByCH++;
    }
  };

  onRiptideCast = (event: CastEvent) => {
    if (this.currentBuffStacks >= this.maxStacks) {
      this.wastedOvercapped++;
    } else {
      this.generatedTotal++;
    }

    this.riptideCasts.push({
      timestamp: event.timestamp,
      stacks: this.currentBuffStacks,
    });
  };

  buildStackChanges = () => {
    const history = this.selectedCombatant.getBuffHistory(
      SPELLS.TIDAL_WAVES_BUFF,
      this.selectedCombatant.id,
    );

    const points: StackTracker[] = [{ timestamp: this.owner.fight.start_time, stacks: 0 }];

    for (const instance of history) {
      for (const step of instance.stackHistory) {
        points.push({ timestamp: step.timestamp, stacks: step.stacks });
      }
      if (instance.end !== null) {
        points.push({ timestamp: instance.end, stacks: 0 });
      }
    }

    points.sort((a, b) => a.timestamp - b.timestamp);
    this.stackChanges = points;
  };

  get suggestionThresholds() {
    const totalTwGenerated = this.generatedTotal + this.wastedOvercapped;
    const totalTwUsed = this.consumedByHW + this.consumedByCH;
    const unusedTwRate = totalTwGenerated > 0 ? 1 - totalTwUsed / totalTwGenerated : 0;

    return {
      actual: unusedTwRate,
      isGreaterThan: {
        minor: 0.5,
        average: 0.8,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
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
            interpolate: 'step-after' as const,
            line: {
              color: RESTORATION_COLORS.HEALING_RAIN,
              strokeWidth: 0.75,
            },
            color: RESTORATION_COLORS.CHAIN_HEAL,
          },
          encoding: {
            y: {
              field: 'stacks',
              type: 'quantitative' as const,
              title: 'Stacks',
              axis: {
                grid: false,
                format: '~s',
                tickCount: 2,
              },
            },
            tooltip: [
              {
                field: 'stacks',
                type: 'quantitative' as const,
                title: 'Stacks',
              },
            ],
          },
        },
        {
          data: {
            name: 'riptideCasts',
          },
          transform: [
            {
              calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
              as: 'timestamp_shifted',
            },
            {
              calculate: `'Riptide cast'`,
              as: 'series',
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
            color: {
              field: 'series',
              type: 'nominal' as const,
              scale: {
                domain: ['Riptide cast'],
                range: [RESTORATION_COLORS.RIPTIDE],
              },
              legend: {
                title: 'Events',
                orient: 'left' as const,
              },
            },
            tooltip: [
              {
                field: 'stacks',
                type: 'quantitative' as const,
                title: 'Stacks at Riptide cast',
              },
            ],
          },
        },
      ],
      config: {
        axis: {
          titleFontWeight: 'normal',
          titleFontSize: 14,
        },
        axisY: {
          titleAngle: 360,
          titlePadding: 40,
        },
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
    const consumedTotal = this.consumedByHW + this.consumedByCH;
    const fakeHastePercent = fakeHaste.TIDAL_WAVES_CAST_SPEED_MODIFIER * 100;

    return (
      <>
        <p>
          <strong>
            <SpellLink spell={SPELLS.TIDAL_WAVES_BUFF} />
          </strong>{' '}
          reduces the cast time of your next <SpellLink spell={SPELLS.HEALING_WAVE} /> or{' '}
          <SpellLink spell={TALENTS.CHAIN_HEAL_TALENT} /> by {fakeHastePercent}%. It is generated by
          casting <SpellLink spell={TALENTS.RIPTIDE_TALENT} /> and stacks up to {this.maxStacks}{' '}
          times
          {this.maxStacks === 3 && (
            <>
              {' '}
              (increased by <SpellLink spell={TALENTS.PRIMORDIAL_CAPACITY_TALENT} /> for Farseer.)
            </>
          )}
          .
        </p>

        <ul>
          <li>
            <strong>Stacks Generated:</strong> {this.generatedTotal} (from{' '}
            <SpellLink spell={TALENTS.RIPTIDE_TALENT} />)
          </li>
          <li>
            <strong>Stacks Consumed:</strong> {consumedTotal} ({this.consumedByHW} on{' '}
            <SpellLink spell={SPELLS.HEALING_WAVE} />, {this.consumedByCH} on{' '}
            <SpellLink spell={TALENTS.CHAIN_HEAL_TALENT} />)
          </li>
          <li>
            <strong>Stacks Wasted (Overcapped):</strong>{' '}
            <span className={this.wastedOvercapped > 0 ? 'text-danger' : 'text-success'}>
              {this.wastedOvercapped}
            </span>
          </li>
        </ul>

        <p>
          You successfully buffed {consumedTotal} casts, saving cast time equivalent to a{' '}
          {fakeHastePercent}% haste modifier per cast. Try to avoid casting{' '}
          <SpellLink spell={TALENTS.RIPTIDE_TALENT} /> when you already have 2 stacks of{' '}
          <SpellLink spell={SPELLS.TIDAL_WAVES_BUFF} /> to prevent wasting the buff. Below is a
          graph showing your stacks over time and when you cast{' '}
          <SpellLink spell={TALENTS.RIPTIDE_TALENT} /> (blue diamonds):
        </p>

        <div style={{ marginTop: 15 }}>{this.plot}</div>
      </>
    );
  }
}
