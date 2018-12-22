import React from 'react';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import Analyzer from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import StatTracker from 'parser/shared/modules/StatTracker';
import { formatPercentage } from 'common/format';
import { formatNumber } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';

/**
* Sea Giant's Tidestone
* Item Level 280
* Binds when picked up
* Unique-Equipped
* Trinket	
* +117 Intellect
* Use: Increase your Haste by 372 for 12 sec. (1 Min, 30 Sec Cooldown)
 *
 * Testing Log:
 * https://www.warcraftlogs.com/reports/ABH7D8W1Qaqv96mt#fight=2&type=summary&source=9
 */

class SeaGiantsTidestone extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    statTracker: StatTracker,
  };
  
  casts = 0;
  haste = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(
      ITEMS.SEA_GIANTS_TIDESTONE.id
    );
    if (this.active) {
      this.haste = calculateSecondaryStatDefault(370, 985, this.selectedCombatant.getItem(ITEMS.SEA_GIANTS_TIDESTONE.id).itemLevel);

      this.abilities.add({
        spell: SPELLS.FEROCITY_OF_THE_SKROG,
        name: ITEMS.SEA_GIANTS_TIDESTONE.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
        },
      });

      this.statTracker.add(SPELLS.FEROCITY_OF_THE_SKROG.id, {
        haste: this.haste,
      });
    }
  }
  
  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.FEROCITY_OF_THE_SKROG.id) {
    return;
    }
    this.casts += 1;
  }
  
  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FEROCITY_OF_THE_SKROG.id) / this.owner.fightDuration;
  }
  
  item() {
    return {
      item: ITEMS.SEA_GIANTS_TIDESTONE,
      result: (
        <dfn data-tip={`Average haste gained ${formatNumber(this.haste * this.totalBuffUptime)}`}>
          Used {this.casts} times / {formatPercentage(this.totalBuffUptime)}% uptime
        </dfn>
      ),
    };
  }
}

export default SeaGiantsTidestone;
