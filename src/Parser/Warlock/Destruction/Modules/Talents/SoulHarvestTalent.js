import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import SoulHarvest from './SoulHarvest';

class SoulHarvestTalent extends Analyzer {
  static dependencies = {
    soulHarvest: SoulHarvest,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SOUL_HARVEST_TALENT.id);
  }

  subStatistic() {
    if (!this.active){
      return;
    }
    
    const bonusDmg = this.soulHarvest.talentBonusDmg;
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.SOUL_HARVEST_TALENT.id}>
            <SpellIcon id={SPELLS.SOUL_HARVEST_TALENT.id} noLink /> Soul Harvest Gain
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`Your Soul Harvest contributed ${formatNumber(bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(bonusDmg))}%).`}>
            {formatNumber(bonusDmg / this.owner.fightDuration * 1000)} DPS
          </dfn>
        </div>
      </div>
    );
  }
}

export default SoulHarvestTalent;
