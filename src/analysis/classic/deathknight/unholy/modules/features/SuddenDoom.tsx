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

// Sudden Doom lasts 10 seconds if unused.
const BUFF_DURATION_MS = 10_000;

class SuddenDoom extends Analyzer {
  totalProcs = 0;
  usedProcs = 0;
  overwrittenProcs = 0;
  expiredProcs = 0;

  private _lastProcTimestamp = 0;
  private _activeProc = false;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM),
      this.onApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM),
      this.onRefresh,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM),
      this.onRemove,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEATH_COIL_DK),
      this.onDeathCoil,
    );
  }

  onApply(event: ApplyBuffEvent) {
    this.totalProcs += 1;
    this._lastProcTimestamp = event.timestamp;
    this._activeProc = true;
  }

  onRefresh(event: RefreshBuffEvent) {
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
      this.expiredProcs += 1;
    }
    this._activeProc = false;
  }

  onDeathCoil(_event: CastEvent) {
    if (this._activeProc) {
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
              Sudden Doom procs.
            </div>
            {this.overwrittenProcs > 0 && (
              <div>{this.overwrittenProcs} proc(s) overwritten by a new proc.</div>
            )}
            {this.expiredProcs > 0 && <div>{this.expiredProcs} proc(s) expired unused.</div>}
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.SUDDEN_DOOM}>
          {formatPercentage(this.efficiency)}% <small>efficiency</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SuddenDoom;
