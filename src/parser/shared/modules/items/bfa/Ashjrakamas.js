import React from 'react';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import UptimeIcon from 'interface/icons/Uptime';
import PrimaryStatIcon from 'interface/icons/PrimaryStat';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import { formatPercentage, formatNumber } from 'common/format';
import { TooltipElement } from 'common/Tooltip';
import { calculatePrimaryStat } from 'common/stats';

/**
 * Ashjra'kamas, Shroud of Resolve -
 * Equip: Your spells and abilities have a chance to increase your $pri by 1900 for 15 sec.
 */
class Ashjrakamas extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  stats = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBack(ITEMS.ASHJRAKAMAS_SHROUD_OF_RESOLVE.id);
    if (!this.active) {
      return;
    }

    this.stats = calculatePrimaryStat(492, 3386, this.selectedCombatant.getItem(ITEMS.ASHJRAKAMAS_SHROUD_OF_RESOLVE.id).itemLevel);

    this.statTracker.add(SPELLS.DRACONIC_EMPOWERMENT.id, {
      intellect: this.stats,
      strength: this.stats,
      agility: this.stats,
    });
  }

  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.DRACONIC_EMPOWERMENT.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.ASHJRAKAMAS_SHROUD_OF_RESOLVE}>
          <PrimaryStatIcon stat={this.selectedCombatant.spec.primaryStat} /> <TooltipElement content={(
            <div>
              <UptimeIcon /> {formatPercentage(this.totalBuffUptime, 2)}% uptime
            </div>
          )}
          > {formatNumber(this.totalBuffUptime * this.stats)} <small>average {this.selectedCombatant.spec.primaryStat} gained</small></TooltipElement><br />
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default Ashjrakamas;
