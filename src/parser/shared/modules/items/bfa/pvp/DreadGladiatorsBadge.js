import React from 'react';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import Analyzer from 'parser/core/Analyzer';
import { formatPercentage, formatNumber } from 'common/format';
import { calculatePrimaryStat } from 'common/stats';
import Abilities from 'parser/shared/modules/Abilities';

/**
 * Dread Gladiator's Badge -
 * Increases primary stat by 657 for 15 sec. (2 Min Cooldown)
 */
class DreadGladiatorsBadge extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  statBuff = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.DREAD_GLADIATORS_BADGE.id);

    if (this.active) {
      this.statBuff = calculatePrimaryStat(385, 1746, this.selectedCombatant.getItem(ITEMS.DREAD_GLADIATORS_BADGE.id).itemLevel);
      this.abilities.add({
        spell: SPELLS.DIG_DEEP,
        buffSpellId: SPELLS.DIG_DEEP.id,
        name: ITEMS.DREAD_GLADIATORS_BADGE.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
        },
      });
    }
  }

  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.DIG_DEEP.id) / this.owner.fightDuration;
  }

  item() {
    return {
      item: ITEMS.DREAD_GLADIATORS_BADGE,
      result: (
        <>
          {formatPercentage(this.totalBuffUptime)}% uptime<br />
          {formatNumber(this.totalBuffUptime * this.statBuff)} average Primary Stat
        </>
      ),
    };
  }
}

export default DreadGladiatorsBadge;
