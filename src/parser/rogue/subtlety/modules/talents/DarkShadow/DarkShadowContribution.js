import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import DarkShadow from './DarkShadow';
import DanceDamageTracker from '../../core/DanceDamageTracker';


class DarkShadowContribution extends DarkShadow {
  static dependencies = {
    ...DarkShadow.dependencies,
    danceDamageTracker: DanceDamageTracker,
  }  

  get darkShadowDamageFactor() {
    return 0.25;
  }

  statistic() {    
    const danceDamage = Object.keys(this.danceDamageTracker.abilities)
    .map(abilityId => this.danceDamageTracker.abilities[abilityId].damageEffective || 0)
    .reduce((a,b) => a+b,0) * this.darkShadowDamageFactor / (1 + this.darkShadowDamageFactor);
     
    return (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.DARK_SHADOW_TALENT.id} />}
          value={`${formatNumber(danceDamage / this.owner.fightDuration * 1000)} DPS`}
          label="Damage contribution from Dark Shadow"
          tooltip={`Total damage increase is ${formatNumber(danceDamage)} in ${this.totalShadowDanceCast} Shadow Dance casts.`}
          />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(2);
}

export default DarkShadowContribution;
