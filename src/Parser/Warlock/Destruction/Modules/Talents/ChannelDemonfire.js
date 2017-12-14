import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';

class ChannelDemonfire extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.CHANNEL_DEMONFIRE_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.CHANNEL_DEMONFIRE_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {    
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.CHANNEL_DEMONFIRE_TALENT.id}>
            <SpellIcon id={SPELLS.CHANNEL_DEMONFIRE_TALENT.id} noLink /> Channel Demonfire Gain
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`Your Channel Demonfire contributed ${formatNumber(this.damage)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))}%).`}>
            {formatNumber(this.damage / this.owner.fightDuration * 1000)} DPS
          </dfn>
        </div>
      </div>
    );
  }
}

export default ChannelDemonfire;
