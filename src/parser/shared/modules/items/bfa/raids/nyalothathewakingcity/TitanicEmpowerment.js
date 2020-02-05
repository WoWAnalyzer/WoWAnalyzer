import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import ITEMS from 'common/ITEMS';
import StatTracker from 'parser/shared/modules/StatTracker';
import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import UptimeIcon from 'interface/icons/Uptime';
import { formatPercentage, formatNumber } from 'common/format';
import PrimaryStatIcon from 'interface/icons/PrimaryStat';
import SpellLink from 'common/SpellLink';

const PRIMARY_STAT = 1091; // The 2-set gives a static amount of primary stat
class TitanicEmpowerment extends Analyzer {

  static dependencies = {
    statTracker: StatTracker,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.VITA_CHARGED_TITANSHARD.id) && this.selectedCombatant.hasTrinket(ITEMS.VOID_TWISTED_TITANSHARD.id);

    if (this.active) {
      this.statTracker.add(SPELLS.TITANIC_EMPOWERMENT.id, {
        strength: PRIMARY_STAT,
        intellect: PRIMARY_STAT,
        agility: PRIMARY_STAT,
      });
    }
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.TITANIC_EMPOWERMENT.id) / this.owner.fightDuration;
  }
  get averageStatModifier() {
    return PRIMARY_STAT * this.uptime;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <div className="pad">
          <label><SpellLink id={SPELLS.TITANIC_EMPOWERMENT.id} /></label>

          <div className="value">
            <UptimeIcon /> {formatPercentage(this.uptime, 0)}% <small>uptime</small><br />
            <PrimaryStatIcon stat={this.selectedCombatant.spec.primaryStat} /> {formatNumber(this.averageStatModifier)} <small>average {this.selectedCombatant.spec.primaryStat} gained</small><br />
          </div>
        </div>
      </Statistic>
    );
  }
}

export default TitanicEmpowerment;
