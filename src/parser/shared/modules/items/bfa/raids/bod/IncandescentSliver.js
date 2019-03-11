import React from 'react';

import { calculateSecondaryStatDefault } from 'common/stats';
import { formatNumber } from 'common/format';

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

  get averageCritRating() {
    const averageStacks = this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.INCANDESCENT_LUSTER.id) / this.owner.fightDuration;
    return averageStacks * this.critRating;
  }

  get averageMasteryRating() {
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
    return (
      <StatisticBox
        icon={<ItemIcon id={ITEMS.INCANDESCENT_SLIVER.id} />}
        value={(
          <>
            {formatNumber(this.averageCritRating)} average Crit
            <br />
            {formatNumber(this.averageMasteryRating)} average Mastery
          </>
        )}
        label="Incandescent Sliver"
        tooltip={`The following players also had this trinket equipped: ${playersWithTrinket.map(player => ` ${player._combatantInfo.name} (${player.spec.className})`)}.`}
        category={STATISTIC_CATEGORY.ITEMS} />
    );
  }
}

export default IncandescentSliver;
