import React from 'react';

import SPELLS from 'common/SPELLS';

import { formatNumber, formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import SharedSoulHarvestTalent from '../../../Shared/Modules/Talents/SoulHarvestTalent';

class SoulHarvestTalent extends SharedSoulHarvestTalent {
  // Destro has the module listed only as a substatistic, so override the shared statistic to not show
  statistic() {}

  subStatistic() {
    const bonusDmg = this.soulHarvest.talentBonusDmg;
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.SOUL_HARVEST_TALENT.id}>
            Soul Harvest Gain
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
