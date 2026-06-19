import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

/**
 * Tracks Unholy Frenzy uptime (+20% attack speed, off-GCD).
 *
 * Unholy Frenzy is a 30s buff on a 3-minute CD that should be kept up as
 * much as possible and aligned with Gargoyle / Pillar-equivalent burst.
 */
class UnholyFrenzy extends Analyzer {
  private _totalUptime = 0;
  private _windows = 0;
  private _lastApply: number | null = null;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.UNHOLY_FRENZY),
      this.onApply,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.UNHOLY_FRENZY),
      this.onRemove,
    );
  }

  private onApply(event: ApplyBuffEvent) {
    this._lastApply = event.timestamp;
    this._windows += 1;
  }

  private onRemove(event: RemoveBuffEvent) {
    if (this._lastApply !== null) {
      this._totalUptime += event.timestamp - this._lastApply;
      this._lastApply = null;
    }
  }

  get uptimePct() {
    const fightMs = this.owner.fight.end_time - this.owner.fight.start_time;
    return fightMs > 0 ? this._totalUptime / fightMs : 0;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(55)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={`${this._windows} Unholy Frenzy windows — ${(this._totalUptime / 1000).toFixed(1)}s total uptime`}
      >
        <div className="pad">
          <label>Unholy Frenzy</label>
          <div className="value">
            {formatPercentage(this.uptimePct)}% <small>uptime</small>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default UnholyFrenzy;
