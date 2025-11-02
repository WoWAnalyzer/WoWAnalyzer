import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';

const BAR_COLOR = '#9933cc';

class MoonfireUptime extends Analyzer {
  get suggestionThresholds() {
    const moonfireUptime =
      this.enemies.getBuffUptime(SPELLS.MOONFIRE_DEBUFF.id) / this.owner.fightDuration;
    return {
      actual: moonfireUptime,
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
    return this.enemies.getDebuffHistory(SPELLS.MOONFIRE_DEBUFF.id);
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.MOONFIRE_DEBUFF],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
    });
  }
}

export default MoonfireUptime;
