import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic/warrior';
import { SpellIcon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import UptimeBar from 'parser/ui/UptimeBar';

/**
 * Colossus Smash applies an armor-bypass debuff to the target. In MoP the cast and
 * the debuff share the same spell id (86346), so uptime is read straight from the
 * Enemies module's recorded debuff history.
 *
 * Note: unlike a maintained DoT, Colossus Smash has a ~6s debuff on a ~20s cooldown,
 * so its theoretical max uptime is only ~30%. We surface uptime as information only
 * and intentionally do not raise a "keep it up" suggestion here -- using it on
 * cooldown is already evaluated by cast efficiency.
 */
class ColossusSmash extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.COLOSSUS_SMASH.id) / this.owner.fightDuration;
  }

  statistic() {
    const history = this.enemies.getDebuffHistory(SPELLS.COLOSSUS_SMASH.id);
    return (
      <StatisticBar wide position={STATISTIC_ORDER.CORE(10)}>
        <div className="flex">
          <div className="flex-sub icon">
            <SpellIcon spell={SPELLS.COLOSSUS_SMASH} />
          </div>
          <div className="flex-sub value" style={{ width: 140 }}>
            {formatPercentage(this.uptime, 0)}% <small>uptime</small>
          </div>
          <div className="flex-main chart" style={{ padding: 15 }}>
            <UptimeBar
              uptimeHistory={history}
              start={this.owner.fight.start_time}
              end={this.owner.fight.end_time}
            />
          </div>
        </div>
      </StatisticBar>
    );
  }
}

export default ColossusSmash;
