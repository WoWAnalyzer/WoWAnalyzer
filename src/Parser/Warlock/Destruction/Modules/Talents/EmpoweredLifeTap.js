import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

import SharedEmpoweredLifeTap from '../../../Shared/Modules/Talents/EmpoweredLifeTap';

class EmpoweredLifeTap extends SharedEmpoweredLifeTap {
  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.EMPOWERED_LIFE_TAP_TALENT.id}>
            <SpellIcon id={SPELLS.EMPOWERED_LIFE_TAP_TALENT.id} noLink /> Empowered Life Tap Uptime
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`Your Empowered Life Tap contributed ${formatNumber(this.bonusDmg / this.owner.fightDuration * 1000)} DPS / ${formatNumber(this.bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%).`}>
            {formatPercentage(this.uptime)} %
          </dfn>
        </div>
      </div>
    );
  }
}

export default EmpoweredLifeTap;
