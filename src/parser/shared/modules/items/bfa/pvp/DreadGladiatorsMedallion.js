import React from 'react';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import Analyzer from 'parser/core/Analyzer';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import UptimeIcon from 'interface/icons/Uptime';
import VersatilityIcon from 'interface/icons/Versatility';
import { formatPercentage, formatNumber } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';
import Abilities from 'parser/core/modules/Abilities';

/**
 * Dread Gladiator's Medallion -
 * Use: Increases Versatility by 429 for 20 sec. (2 Min Cooldown)
 */
class DreadGladiatorsMedallion extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };
  statBuff = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.DREAD_GLADIATORS_MEDALLION.id);

    if (this.active) {
      this.statBuff = calculateSecondaryStatDefault(300, 576, this.selectedCombatant.getItem(ITEMS.DREAD_GLADIATORS_MEDALLION.id).itemLevel);
      this.abilities.add({
        spell: SPELLS.RAPID_ADAPTATION,
        buffSpellId: SPELLS.RAPID_ADAPTATION.id,
        name: ITEMS.DREAD_GLADIATORS_MEDALLION.name,
        category: Abilities.SPELL_CATEGORIES.ITEMS,
        cooldown: 120,
        gcd: null,
        castEfficiency: {
          suggestion: true,
        },
      });
    }
  }

  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.RAPID_ADAPTATION.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.DREAD_GLADIATORS_MEDALLION}>
          <UptimeIcon /> {formatPercentage(this.totalBuffUptime)}% <small>uptime</small> <br />
          <VersatilityIcon /> {formatNumber(this.totalBuffUptime * this.statBuff)} <small>average Versatility</small>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default DreadGladiatorsMedallion;
