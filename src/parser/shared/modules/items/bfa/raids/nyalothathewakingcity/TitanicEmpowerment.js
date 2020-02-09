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
import { calculatePrimaryStat } from 'common/stats';

//const PRIMARY_STAT = 1091; // The 2-set gives a static amount of primary stat
//But it is potentially bugged at the moment as the effect actually scales with ilvl.
//It is currently averaging (and rounding down) the ilvl of the two trinkets in order to determine the scaling.
class TitanicEmpowerment extends Analyzer {

  static dependencies = {
    statTracker: StatTracker,
  };

  statBuff = 0;

  constructor(...args) {
    super(...args);
    this._vitaItem = this.selectedCombatant.getTrinket(ITEMS.VITA_CHARGED_TITANSHARD.id);
    this._voidItem = this.selectedCombatant.getTrinket(ITEMS.VOID_TWISTED_TITANSHARD.id);
    this.active = !!this._vitaItem && !!this._voidItem;

    if (this.active) {
      this.statBuff = calculatePrimaryStat(445, 1091, Math.floor(this._voidItem.itemLevel + this._vitaItem.itemLevel) / 2);
      this.statTracker.add(SPELLS.TITANIC_EMPOWERMENT.id, {
        strength: this.statBuff,
        intellect: this.statBuff,
        agility: this.statBuff,
      });
    }
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.TITANIC_EMPOWERMENT.id) / this.owner.fightDuration;
  }
  get averageStatModifier() {
    return this.statBuff * this.uptime;
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
