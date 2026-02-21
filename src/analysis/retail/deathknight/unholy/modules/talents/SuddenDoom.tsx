import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import { formatPercentage } from 'common/format';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/* The Sudden Doom buff lasts 10 seconds. We use this to distinguish natural expiration
(removal near the 10s mark) from consumption (removal mid-duration via DC/Epidemic).
This is necessary because WCL event ordering can place removebuff before the cast event
at the same timestamp, making flag-based consumption detection unreliable. */
const BUFF_DURATION_MS = 10000;
const EXPIRE_BUFFER_MS = 100;

class SuddenDoom extends Analyzer {
  totalProcs = 0;
  consumedProcs = 0;
  wastedRefreshes = 0;
  wastedExpires = 0;

  private buffActive = false;
  private buffAppliedAt: number | null = null;

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
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_DOOM_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.DEATH_COIL, SPELLS.EPIDEMIC]),
      this.onCast,
    );
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.totalProcs += 1;
    this.buffActive = true;
    this.buffAppliedAt = event.timestamp;
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    /* Only count as wasted if the previous proc was still unconsumed.
    A refreshbuff can fire on the same tick as a consumption cast, in which case
    buffActive is already false and the old proc was used — not wasted. */
    if (this.buffActive) {
      this.wastedRefreshes += 1;
    }

    this.totalProcs += 1;
    this.buffActive = true;
    this.buffAppliedAt = event.timestamp;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    if (!this.buffActive) {
      return;
    }

    /* Only count as expired if the removal happened near the expected buff expiry.
    Consumption removals happen mid-duration and won't match this window. */
    const expectedExpireAt = (this.buffAppliedAt ?? event.timestamp) + BUFF_DURATION_MS;
    if (
      event.timestamp >= expectedExpireAt - EXPIRE_BUFFER_MS &&
      event.timestamp <= expectedExpireAt + EXPIRE_BUFFER_MS
    ) {
      this.wastedExpires += 1;
    }

    this.buffActive = false;
    this.buffAppliedAt = null;
  }

  onCast(_event: CastEvent) {
    if (!this.buffActive) {
      return;
    }

    this.consumedProcs += 1;
    this.buffActive = false;
    this.buffAppliedAt = null;
  }

  get wastedProcs() {
    return this.wastedRefreshes + this.wastedExpires;
  }

  get wasteRate() {
    return this.totalProcs > 0 ? this.wastedProcs / this.totalProcs : 0;
  }

  get efficiency() {
    return this.totalProcs > 0 ? 1 - this.wasteRate : 1;
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
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        size="flexible"
        tooltip={
          <>
            <div>
              You wasted {this.wastedProcs} out of {this.totalProcs} Sudden Doom procs (
              {formatPercentage(this.wasteRate)}%).
            </div>
            <div>
              {this.wastedExpires} procs expired without being used and {this.wastedRefreshes} procs
              were overwritten by new procs.
            </div>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.SUDDEN_DOOM_BUFF}>
          <>
            {formatPercentage(this.efficiency)} % <small>efficiency</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SuddenDoom;
