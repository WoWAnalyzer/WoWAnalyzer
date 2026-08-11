import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Combatants from 'parser/shared/modules/Combatants';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import {
  ABILITIES_AFFECTED_BY_HEALING_INCREASES,
  RESTORATION_COLORS,
} from 'analysis/retail/shaman/restoration/constants';
import { healingIncreases } from 'src/analysis/retail/shaman/restoration/constants';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
  HealEvent,
} from 'parser/core/Events';
import { isFromPrimalTideCore } from '../../normalizers/EventLinkNormalizer';
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

export default class UndercurrentGraph extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;

  stackChanges: StackTracker[] = [];
  riptideCasts: CastTracker[] = [];
  primalTideCoreProcs: CastTracker[] = [];

  currentStacks = 0;
  hasPrimalTideCore = false;

  lastCastTimestamp = -1;
  lastCastTargetId = -1;
  lastStackTimestamp = -1;
  pendingStacks = 0;

  healing = 0;
  talentRank = 0;

  constructor(options: Options) {
    super(options);
    this.talentRank = this.selectedCombatant.getTalentRank(TALENTS.UNDERCURRENT_TALENT);
    this.active = this.talentRank > 0;
    this.hasPrimalTideCore = this.selectedCombatant.hasTalent(TALENTS.PRIMAL_TIDE_CORE_TALENT);

    this.stackChanges.push({ timestamp: this.owner.fight.start_time, stacks: 0 });
    this.lastStackTimestamp = this.owner.fight.start_time;

    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER | SELECTED_PLAYER_PET)
        .spell(ABILITIES_AFFECTED_BY_HEALING_INCREASES),
      this.heal,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.UNDERCURRENT_BUFF),
      this.onBuffApplied,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.UNDERCURRENT_BUFF),
      this.onStackGained,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.UNDERCURRENT_BUFF),
      this.onStackLost,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.UNDERCURRENT_BUFF),
      this.onBuffRemoved,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.RIPTIDE_TALENT),
      this.onRiptideCast,
    );

    if (this.hasPrimalTideCore) {
      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.RIPTIDE_TALENT),
        this.onApplyRiptide,
      );
    }

    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  _advanceStackTimestamp(newTimestamp: number) {
    if (newTimestamp !== this.lastStackTimestamp) {
      this._registerStackChange();
    }
    this.lastStackTimestamp = newTimestamp;
  }

  _registerStackChange() {
    this.currentStacks = this.pendingStacks;
    this.stackChanges.push({
      timestamp: this.lastStackTimestamp,
      stacks: this.currentStacks,
    });
  }

  onBuffApplied(event: ApplyBuffEvent) {
    this._advanceStackTimestamp(event.timestamp);
    this.pendingStacks = 1;
  }

  onStackGained(event: ApplyBuffStackEvent) {
    this._advanceStackTimestamp(event.timestamp);
    this.pendingStacks += 1;
  }

  onStackLost(event: RemoveBuffStackEvent) {
    this._advanceStackTimestamp(event.timestamp);
    this.pendingStacks -= 1;
  }

  onBuffRemoved(event: RemoveBuffEvent) {
    this._advanceStackTimestamp(event.timestamp);
    this.pendingStacks = 0;
  }

  onFightEnd() {
    this._registerStackChange();
  }

  onRiptideCast(event: CastEvent) {
    this.lastCastTimestamp = event.timestamp;
    this.lastCastTargetId = event.targetID ?? -1;
    this.riptideCasts.push({
      timestamp: event.timestamp,
      stacks: this.currentStacks,
    });
  }

  onApplyRiptide(event: ApplyBuffEvent) {
    if (!isFromPrimalTideCore(event)) {
      return;
    }
    if (
      Math.abs(event.timestamp - this.lastCastTimestamp) <= 5 &&
      event.targetID === this.lastCastTargetId
    ) {
      return;
    }
    this.primalTideCoreProcs.push({
      timestamp: event.timestamp,
      stacks: this.currentStacks,
    });
  }

  heal(event: HealEvent) {
    const target = this.combatants.players[event.targetID];
    if (!target) {
      return;
    }

    const undercurrentHealIncrease =
      this.selectedCombatant.getBuffStacks(SPELLS.UNDERCURRENT_BUFF.id) *
      healingIncreases.UNDERCURRENT_HEALING_INCREASE[this.talentRank];
    this.healing += calculateEffectiveHealing(event, undercurrentHealIncrease);
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
                domain: ['Riptide cast', 'Primal Tide Core'],
                range: [RESTORATION_COLORS.RIPTIDE, RESTORATION_COLORS.PRIMAL_TIDE_CORE],
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
        ...(this.hasPrimalTideCore
          ? [
              {
                data: {
                  name: 'primalTideCoreProcs',
                },
                transform: [
                  {
                    calculate: `datum.timestamp - ${this.owner.fight.start_time}`,
                    as: 'timestamp_shifted',
                  },
                  {
                    calculate: `'Primal Tide Core'`,
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
                      domain: ['Riptide cast', 'Primal Tide Core'],
                      range: [RESTORATION_COLORS.RIPTIDE, RESTORATION_COLORS.PRIMAL_TIDE_CORE],
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
                      title: 'Primal Tide Core proc',
                    },
                  ],
                },
              },
            ]
          : []),
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
                primalTideCoreProcs: this.primalTideCoreProcs,
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
    return (
      <>
        <strong>
          <SpellLink spell={TALENTS.UNDERCURRENT_TALENT} />
        </strong>{' '}
        &mdash; this graph shows your <SpellLink spell={TALENTS.UNDERCURRENT_TALENT} /> stacks over
        the fight, with <SpellLink spell={TALENTS.RIPTIDE_TALENT} /> casts (blue diamonds)
        {this.hasPrimalTideCore && (
          <>
            {' '}
            and <SpellLink spell={TALENTS.PRIMAL_TIDE_CORE_TALENT} /> procs (green diamonds)
          </>
        )}
        <p>On the graph, this should show up as clear cycles: </p>
        <div style={{ marginTop: 15 }}>{this.plot}</div>
      </>
    );
  }
}
