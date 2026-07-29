import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

/**
 * Tracks Unholy Presence uptime for Unholy DK.
 *
 * Unholy DK should maintain Unholy Presence (+15% movement speed, +10% attack
 * speed, reduced GCD to 1s) throughout the encounter. Dropping or switching
 * presence is a direct DPS loss.
 */
class UnholyPresenceUptime extends Analyzer {
  get uptimePct() {
    return this.owner.fightDuration > 0
      ? this.selectedCombatant.getBuffUptime(SPELLS.UNHOLY_PRESENCE.id) / this.owner.fightDuration
      : 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptimePct,
      isLessThan: {
        minor: 0.99,
        average: 0.95,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(80)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <div className="pad">
          <label>Unholy Presence</label>
          <div className="value">
            {formatPercentage(this.uptimePct)}% <small>uptime</small>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default UnholyPresenceUptime;
