import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// Killing Machine expires after 10 seconds if unused.
const BUFF_DURATION_MS = 10_000;

// KM is consumed by Obliterate or Frost Strike (makes it a guaranteed crit).
const KM_CONSUMERS = new Set([SPELLS.OBLITERATE.id, SPELLS.FROST_STRIKE.id]);

class KillingMachine extends Analyzer {
  totalProcs = 0;
  usedProcs = 0;
  overwrittenProcs = 0;
  expiredProcs = 0;

  private _lastProcTimestamp = 0;
  private _activeProc = false;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.KILLING_MACHINE),
      this.onApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.KILLING_MACHINE),
      this.onRefresh,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.KILLING_MACHINE),
      this.onRemove,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onApply(event: ApplyBuffEvent) {
    this.totalProcs += 1;
    this._lastProcTimestamp = event.timestamp;
    this._activeProc = true;
  }

  onRefresh(event: RefreshBuffEvent) {
    // A refresh means the previous proc was overwritten before being used.
    if (this._activeProc) {
      this.overwrittenProcs += 1;
    }
    this.totalProcs += 1;
    this._lastProcTimestamp = event.timestamp;
    this._activeProc = true;
  }

  onRemove(event: RemoveBuffEvent) {
    if (!this._activeProc) {
      return;
    }
    const held = event.timestamp - this._lastProcTimestamp;
    if (held >= BUFF_DURATION_MS - 50) {
      // Allow 50 ms log jitter before calling it expired.
      this.expiredProcs += 1;
    }
    this._activeProc = false;
  }

  onCast(event: CastEvent) {
    if (this._activeProc && KM_CONSUMERS.has(event.ability.guid)) {
      this.usedProcs += 1;
      this._activeProc = false;
    }
  }

  get wastedProcs() {
    return this.overwrittenProcs + this.expiredProcs;
  }

  get efficiency() {
    if (this.totalProcs === 0) {
      return 1;
    }
    return this.usedProcs / this.totalProcs;
  }

  get suggestionThresholds() {
    return {
      actual: this.efficiency,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        tooltip={
          <>
            <div>
              You used <strong>{this.usedProcs}</strong> of <strong>{this.totalProcs}</strong>{' '}
              Killing Machine procs.
            </div>
            {this.overwrittenProcs > 0 && (
              <div>{this.overwrittenProcs} proc(s) overwritten by a new proc.</div>
            )}
            {this.expiredProcs > 0 && <div>{this.expiredProcs} proc(s) expired unused.</div>}
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.KILLING_MACHINE}>
          {formatPercentage(this.efficiency)}% <small>efficiency</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default KillingMachine;
