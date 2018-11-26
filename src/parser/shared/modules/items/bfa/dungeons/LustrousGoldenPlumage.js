import React from 'react';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import Analyzer from 'parser/core/Analyzer';
import { formatPercentage, formatNumber } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';
import Abilities from 'parser/core/modules/Abilities';

/**
 * Lustrous Golden Plumage -
 * Use: Increase your Versatility by 614 for 20 sec. (2 Min Cooldown)
 */
class LustrousGoldenPlumage extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  statBuff = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.LUSTROUS_GOLDEN_PLUMAGE.id);

    if (this.active) {
      this.statBuff = calculateSecondaryStatDefault(380, 864, this.selectedCombatant.getItem(ITEMS.LUSTROUS_GOLDEN_PLUMAGE.id).itemLevel);
      this.abilities.add({
        spell: SPELLS.GOLDEN_LUSTER,
        buffSpellId: SPELLS.GOLDEN_LUSTER.id,
        name: ITEMS.LUSTROUS_GOLDEN_PLUMAGE.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
        },
      });
    }
  }

  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.GOLDEN_LUSTER.id) / this.owner.fightDuration;
  }

  item() {
    return {
      item: ITEMS.LUSTROUS_GOLDEN_PLUMAGE,
      result: (
        <>
          {formatPercentage(this.totalBuffUptime)}% uptime<br />
          {formatNumber(this.totalBuffUptime * this.statBuff)} average Versatility
        </>
      ),
    };
  }
}

export default LustrousGoldenPlumage;
