import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import StatTracker from 'parser/shared/modules/StatTracker';
import { formatPercentage } from 'common/format';
import { formatNumber } from 'common/format';
import { calculatePrimaryStat } from 'common/stats';

/*
* Ancient Knot of Wisdom
* Heroic
* Item Level 385
* Binds when picked up
* Unique-Equipped
* Trinket
* +176 Mastery
* Use: Increase your Intellect by 1060 decreasing by 212 every 4 sec. (1 Min Cooldown)
*
* Testing Log:
* https://www.warcraftlogs.com/reports/t2ZK6pQvgLGqj7by#fight=1&source=13
*/

class AncientKnotOfWisdom extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    statTracker: StatTracker,
  };
  
  casts = 0;
  intellectPerStack = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(
      ITEMS.ANCIENT_KNOT_OF_WISDOM.id
    );
    if (this.active) {
      this.intellectPerStack = calculatePrimaryStat(355, 40, this.selectedCombatant.getItem(ITEMS.ANCIENT_KNOT_OF_WISDOM.id).itemLevel);

      this.abilities.add({
        spell: SPELLS.WISDOM_OF_THE_FOREST_LORD,
        name: ITEMS.ANCIENT_KNOT_OF_WISDOM.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
        },
      });

      /* Changed to use int per stack. */
      this.statTracker.add(SPELLS.WISDOM_OF_THE_FOREST_LORD.id, {
        intellect: this.intellectPerStack,
      });
    }
  }
  
  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.WISDOM_OF_THE_FOREST_LORD.id) {
      return;
    }
    this.casts += 1;
  }
  
  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.WISDOM_OF_THE_FOREST_LORD.id) / this.owner.fightDuration;
  }

  get averageIntellect() {
    const averageStacks = this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.WISDOM_OF_THE_FOREST_LORD.id) / this.owner.fightDuration;
    return (averageStacks * this.intellectPerStack).toFixed(0);
  }

  item() {
    return {
      item: ITEMS.ANCIENT_KNOT_OF_WISDOM,
      result: (
        <dfn data-tip={`Used ${this.casts} times`}>
          {formatPercentage(this.totalBuffUptime)}% uptime<br />
          {formatNumber(this.averageIntellect)} average Intellect
        </dfn>
      ),
    };
  }
}

export default AncientKnotOfWisdom;
