import React from 'react';

import Module from 'Parser/Core/Module';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import SoulHarvest from './SoulHarvest';

class SoulHarvestTalent extends Module {
  static dependencies = {
    soulHarvest: SoulHarvest,
  };

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTalent(SPELLS.SOUL_HARVEST_TALENT.id);
    }
  }

  statistic() {
    const bonusDmg = this.soulHarvest.talentBonusDmg;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SOUL_HARVEST.id} />}
        value={`${formatNumber(bonusDmg / this.owner.fightDuration * 1000)} DPS`}
        label='Damage contributed'
        tooltip={`Your Soul Harvest contributed ${formatNumber(bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(bonusDmg))} %).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(2);
}

export default SoulHarvestTalent;
