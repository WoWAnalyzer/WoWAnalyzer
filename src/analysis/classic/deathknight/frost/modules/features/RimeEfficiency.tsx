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

// Freezing Fog (Rime proc) lasts 15 seconds.
const BUFF_DURATION_MS = 15_000;

class RimeEfficiency extends Analyzer {
  totalProcs = 0;
  usedProcs = 0;
  overwrittenProcs = 0;
  expiredProcs = 0;
  // How many times Obliterate was cast while Rime was active (wasted proc opportunity)
  obliterateWithRime = 0;

  private _lastProcTimestamp = 0;
  private _activeProc = false;

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FREEZING_FOG),
      this.onApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.FREEZING_FOG),
      this.onRefresh,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.FREEZING_FOG),
      this.onRemove,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOWLING_BLAST),
      this.onHowlingBlast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.OBLITERATE),
      this.onObliterate,
    );
  }

  onApply(event: ApplyBuffEvent) {
    this.totalProcs += 1;
    this._lastProcTimestamp = event.timestamp;
    this._activeProc = true;
  }

  onRefresh(event: RefreshBuffEvent) {
    // Rime was overwritten — this only happens if another Obliterate triggered a new
    // proc while the old one was still active.
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

  onHowlingBlast(_event: CastEvent) {
    if (this._activeProc) {
      // Consumed the Rime proc — Howling Blast costs no rune when Freezing Fog is up.
      this.usedProcs += 1;
      this._activeProc = false;
    }
  }

  onObliterate(_event: CastEvent) {
    if (this._activeProc) {
      // Casting Obliterate while Rime is up wastes a free instant Howling Blast.
      this.obliterateWithRime += 1;
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
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(2)}
        size="flexible"
        tooltip={
          <>
            <div>
              You used <strong>{this.usedProcs}</strong> of <strong>{this.totalProcs}</strong> Rime
              (Freezing Fog) procs.
            </div>
            {this.overwrittenProcs > 0 && <div>{this.overwrittenProcs} proc(s) overwritten.</div>}
            {this.expiredProcs > 0 && <div>{this.expiredProcs} proc(s) expired unused.</div>}
            {this.obliterateWithRime > 0 && (
              <div>
                {this.obliterateWithRime}× Obliterate cast while Rime was active (wasted free HB).
              </div>
            )}
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.FREEZING_FOG}>
          {formatPercentage(this.efficiency)}% <small>Rime efficiency</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RimeEfficiency;
