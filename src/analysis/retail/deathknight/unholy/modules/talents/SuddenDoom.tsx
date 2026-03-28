import SPELLS from 'common/SPELLS';
import DK_SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import { formatNumber, formatPercentage } from 'common/format';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SuddenDoomConsumption } from '../../normalizers/SuddenDoomLink';

export interface SuddenDoomProc {
  timestamp: number;
  type: 'consumed' | 'expired' | 'overwritten';
}

class SuddenDoom extends Analyzer {
  private currentStacks = 0;

  readonly procs: SuddenDoomProc[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SUDDEN_DOOM_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM_BUFF),
      this.onApplyBuffStack,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM_BUFF),
      this.onRemoveBuffStack,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([SPELLS.DEATH_COIL, SPELLS.EPIDEMIC, DK_SPELLS.NECROTIC_COIL, DK_SPELLS.GRAVEYARD]),
      this.onCast,
    );
  }

  onApplyBuff(_event: ApplyBuffEvent) {
    this.currentStacks = 1;
  }

  onApplyBuffStack(event: ApplyBuffStackEvent) {
    this.currentStacks = event.stack;
  }

  onRemoveBuffStack(event: RemoveBuffStackEvent) {
    // 2 → 1 stack (consumption at 2 stacks)
    this.procs.push({ timestamp: event.timestamp, type: 'consumed' });
    this.currentStacks = event.stack;
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    // Already at max stacks and a new proc arrived — the oldest is wasted
    this.procs.push({ timestamp: event.timestamp, type: 'overwritten' });
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    if (this.currentStacks === 0) {
      // Already consumed by onCast
      return;
    }

    // Use the event link to determine if this removal was caused by a cast
    const linkedCast = SuddenDoomConsumption.first(event);
    if (linkedCast) {
      this.procs.push({ timestamp: event.timestamp, type: 'consumed' });
    } else {
      this.procs.push({ timestamp: event.timestamp, type: 'expired' });
    }
    this.currentStacks = 0;
  }

  onCast(event: CastEvent) {
    if (this.currentStacks <= 0) {
      // Either no buff, or removebuff already fired at the same timestamp (WCL ordering).
      // In that case, onRemoveBuff already handled it via the event link.
      return;
    }

    if (this.currentStacks === 1) {
      this.procs.push({ timestamp: event.timestamp, type: 'consumed' });
      this.currentStacks = 0;
    }
    // If stacks > 1, removebuffstack handles the consumption tracking
  }

  /** Get procs within a time range */
  procsInRange(start: number, end: number): SuddenDoomProc[] {
    return this.procs.filter((p) => p.timestamp >= start && p.timestamp <= end);
  }

  get totalProcs() {
    return this.procs.length;
  }

  get consumedProcs() {
    return this.procs.filter((p) => p.type === 'consumed').length;
  }

  get wastedProcs() {
    return this.procs.filter((p) => p.type !== 'consumed').length;
  }

  get wastedExpires() {
    return this.procs.filter((p) => p.type === 'expired').length;
  }

  get wastedRefreshes() {
    return this.procs.filter((p) => p.type === 'overwritten').length;
  }

  get wasteRate() {
    return this.totalProcs > 0 ? this.wastedProcs / this.totalProcs : 0;
  }

  get efficiency() {
    return this.totalProcs > 0 ? 1 - this.wasteRate : 1;
  }

  get procsPerMinute() {
    return this.totalProcs / (this.owner.fightDuration / 60000);
  }

  get suggestionThresholds() {
    return {
      actual: this.wasteRate,
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(12)} size="flexible">
        <BoringSpellValueText spell={SPELLS.SUDDEN_DOOM_BUFF}>
          <div>
            {formatPercentage(this.efficiency, 0)}% <small>efficiency</small>
          </div>
          <div>
            {formatNumber(this.procsPerMinute)} <small>procs/min</small>
          </div>
        </BoringSpellValueText>
        <div style={{ padding: '8px' }}>
          <DonutChart
            items={[
              {
                color: '#22c55e',
                label: 'Consumed',
                value: this.consumedProcs,
                valuePercent: false,
                valueTooltip: `${this.consumedProcs} procs used`,
              },
              {
                color: '#ef4444',
                label: 'Expired',
                value: this.wastedExpires,
                valuePercent: false,
                valueTooltip: `${this.wastedExpires} procs expired without being used`,
              },
              {
                color: '#f59e0b',
                label: 'Overwritten',
                value: this.wastedRefreshes,
                valuePercent: false,
                valueTooltip: `${this.wastedRefreshes} procs overwritten by new procs`,
              },
            ]}
          />
        </div>
      </Statistic>
    );
  }
}

export default SuddenDoom;
