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

class RimeEfficiency extends Analyzer {
  totalProcs = 0;
  usedProcs = 0;
  overwrittenProcs = 0;
  expiredProcs = 0;

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
  }

  onApply(_event: ApplyBuffEvent) {
    this.totalProcs += 1;
    this._activeProc = true;
  }

  onRefresh(_event: RefreshBuffEvent) {
    // Rime was overwritten — this only happens if another Obliterate triggered a new
    // proc while the old one was still active.
    if (this._activeProc) {
      this.overwrittenProcs += 1;
    }
    this.totalProcs += 1;
    this._activeProc = true;
  }

  onRemove(_event: RemoveBuffEvent) {
    if (!this._activeProc) {
      return;
    }
    // Reaching here means the proc fell off without being consumed (onHowlingBlast
    // already handles that case) or refreshed (onRefresh handles that). Whether it ran
    // its full natural duration or got cut short by death/encounter end, it was wasted
    // either way — Freezing Fog can't be dispelled, so there's no other way for this
    // to fire.
    this.expiredProcs += 1;
    this._activeProc = false;
  }

  onHowlingBlast(_event: CastEvent) {
    if (this._activeProc) {
      // Consumed the Rime proc — Howling Blast costs no rune when Freezing Fog is up.
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
