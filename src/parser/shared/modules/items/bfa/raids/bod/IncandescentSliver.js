import React from 'react';

import { calculateSecondaryStatDefault } from 'common/stats';
import { formatPercentage, formatNumber } from 'common/format';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';

import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';
import Combatants from 'parser/shared/modules/Combatants';
import StatisticBox from 'interface/others/StatisticBox';
import ItemIcon from 'common/ItemIcon';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';


class IncandescentSliver extends Analyzer {
  critRating = 0;
  masteryRating = 0;

  static dependencies = {
    statTracker: StatTracker,
    combatants: Combatants,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.INCANDESCENT_SLIVER.id);
    if(this.active) {
      const item = this.selectedCombatant.getItem(ITEMS.INCANDESCENT_SLIVER.id);
      this.critRating = calculateSecondaryStatDefault(385, 20, item.itemLevel);
      this.masteryRating = calculateSecondaryStatDefault(385, 66, item.itemLevel);
      this.statTracker.add(SPELLS.INCANDESCENT_LUSTER.id, {
        crit: this.critRating,
      });
      this.statTracker.add(SPELLS.INCANDESCENT_BRILLIANCE.id, {
        mastery: this.masteryRating,
      });
    }
  }

  averageCritRating() {
    const averageStacks = this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.INCANDESCENT_LUSTER.id) / this.owner.fightDuration;
    return averageStacks * this.critRating;
  }

  averageMasteryRating() {
    return this.masteryRating * this.masteryUptime;
  }

  get critUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.INCANDESCENT_LUSTER.id)/this.owner.fightDuration;
  }

  get masteryUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.INCANDESCENT_BRILLIANCE.id)/this.owner.fightDuration;
  }

  item() {
    const playersWithTrinket = [];
    Object.keys(this.combatants.players).forEach((key) => {
      const player = this.combatants.players[key];
      if(player.hasTrinket(ITEMS.INCANDESCENT_SLIVER.id) && player._combatantInfo.name !== this.selectedCombatant._combatantInfo.name){
        playersWithTrinket.push(player);
      }
    });
    const playersTable = (
      <table className="table table-condensed">
        <thead>
          <tr>
            <th>Other Players With Trinket</th>
          </tr>
        </thead>
        <tbody>
          {
            playersWithTrinket.map((player) => {
              return (
                <tr key={player._combatantInfo.name}>
                  <th><p className={player.spec.className}>{player._combatantInfo.name}</p></th>
                </tr>
              );
            })
          }
        </tbody>
      </table>
    );
    return (
      <StatisticBox
        icon={<ItemIcon id={ITEMS.INCANDESCENT_SLIVER.id} />}
        value={`${formatNumber(this.averageCritRating())} Average Crit, ${formatNumber(this.averageMasteryRating())} Average Mastery`}
        label={`Incandescent Sliver`}
        tooltip={`Your crit buff had an uptime of <b>${formatPercentage(this.critUptime)}%</b> and your mastery buff had an uptime of <b>${formatPercentage(this.masteryUptime)}%</b>`}
        category={STATISTIC_CATEGORY.ITEMS}>
        {playersTable}
      </StatisticBox>
    );
  }
}

export default IncandescentSliver;
