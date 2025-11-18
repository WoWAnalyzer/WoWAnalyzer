import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';

const BAR_COLOR = '#dd8811';

class SunfireUptime extends Analyzer {
  get suggestionThresholds() {
    const sunfireUptime = this.enemies.getBuffUptime(SPELLS.SUNFIRE.id) / this.owner.fightDuration;
    return {
      actual: sunfireUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.SUNFIRE.id);
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.SUNFIRE],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
    });
  }
}

export default SunfireUptime;
