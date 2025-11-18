import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic/hunter';
import { SpellIcon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import UptimeBar from 'parser/ui/UptimeBar';

const SERPENT_STING_MOP_DEBUFF_ID = 118253;

class SerpentStingUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SERPENT_STING_MOP_DEBUFF_ID) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.85,
        average: 0.8,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  subStatistic() {
    const history = this.enemies.getDebuffHistory(SERPENT_STING_MOP_DEBUFF_ID);
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon spell={SPELLS.SERPENT_STING} />
        </div>
        <div className="flex-sub value" style={{ width: 140 }}>
          {formatPercentage(this.uptime, 0)} % <small>uptime</small>
        </div>
        <div className="flex-main chart" style={{ padding: 15 }}>
          <UptimeBar
            uptimeHistory={history}
            start={this.owner.fight.start_time}
            end={this.owner.fight.end_time}
          />
        </div>
      </div>
    );
  }
}

export default SerpentStingUptime;
