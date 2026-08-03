import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic/deathknight';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

/**
 * Tracks Frost Fever debuff uptime for Unholy DK.
 */
class FrostFeverUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  get uptimePct() {
    return (
      this.enemies.getBuffUptime(SPELLS.FROST_FEVER.id) /
      (this.owner.fight.end_time - this.owner.fight.start_time)
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.uptimePct,
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
        position={STATISTIC_ORDER.OPTIONAL(11)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <div className="pad">
          <label>Frost Fever</label>
          <div className="value">
            {formatPercentage(this.uptimePct)}% <small>uptime</small>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default FrostFeverUptime;
