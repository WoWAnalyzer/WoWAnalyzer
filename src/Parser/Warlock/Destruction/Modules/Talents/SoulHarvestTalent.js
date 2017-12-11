import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import SmallStatisticBox, { STATISTIC_ORDER } from 'Main/SmallStatisticBox';

import SoulHarvest from './SoulHarvest';

class SoulHarvestTalent extends Analyzer {
  static dependencies = {
    soulHarvest: SoulHarvest,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SOUL_HARVEST_TALENT.id);
  }

  statistic() {
    const bonusDmg = this.soulHarvest.talentBonusDmg;    
    const uptime = this.combatants.selected.getBuffUptime(SPELLS.SOUL_HARVEST_TALENT.id) / this.owner.fightDuration;
    return (
      <SmallStatisticBox
        icon={<SpellIcon id={SPELLS.SOUL_HARVEST_TALENT.id} />}
        value={`${formatPercentage(uptime)} %`}
        label="Soul Harvest Uptime"
        tooltip={`Your Soul Harvest contributed ${formatNumber(bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(bonusDmg))} %).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(8);
}

export default SoulHarvestTalent;
