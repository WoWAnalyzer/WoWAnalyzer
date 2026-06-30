import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

const MIN_TICK_GAP_MS = 800; // DnD ticks every 1s — gaps >800ms = new cast
const MAX_UPTIME_TARGET = 0.27; // 27% target uptime (Python threshold)

/**
 * Tracks Death and Decay uptime for Unholy DK.
 *
 * DnD (10s ground effect, 30s CD) snares enemies and deals periodic AoE
 * shadow damage. Uptime is estimated from damage tick events (one per second),
 * separating ticks by gaps >800ms (to handle multiple ticks occurring in AoE). Target uptime:
 * ~27%.
 */
class DeathAndDecayUptime extends Analyzer {
  private _ticks = 0;
  private _lastTickTime: number | null = null;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DEATH_AND_DECAY),
      this.onDamage,
    );
  }

  private onDamage(event: DamageEvent) {
    if (this._lastTickTime === null || event.timestamp - this._lastTickTime > MIN_TICK_GAP_MS) {
      this._ticks += 1;
      this._lastTickTime = event.timestamp;
    }
  }

  get fightDurationSec() {
    return (this.owner.fight.end_time - this.owner.fight.start_time) / 1000;
  }

  get uptimePct() {
    return this.fightDurationSec > 0 ? this._ticks / this.fightDurationSec : 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptimePct,
      isLessThan: {
        minor: MAX_UPTIME_TARGET,
        average: MAX_UPTIME_TARGET * 0.85,
        major: MAX_UPTIME_TARGET * 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(70)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={`${this._ticks} Death and Decay ticks detected`}
      >
        <div className="pad">
          <label>Death and Decay</label>
          <div className="value">
            {formatPercentage(this.uptimePct)}% <small>uptime</small>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default DeathAndDecayUptime;
