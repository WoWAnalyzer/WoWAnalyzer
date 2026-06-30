import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer from 'parser/core/Analyzer';
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
  private get _totalUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.UNHOLY_FRENZY.id);
  }

  private get _windows() {
    return this.selectedCombatant.getBuffTriggerCount(SPELLS.UNHOLY_FRENZY.id);
  }

  get uptimePct() {
    return this.owner.fightDuration > 0 ? this._totalUptime / this.owner.fightDuration : 0;
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
