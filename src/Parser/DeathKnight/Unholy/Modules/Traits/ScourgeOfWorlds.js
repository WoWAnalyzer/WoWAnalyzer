import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';    
import Enemies from 'Parser/Core/Modules/Enemies';
import getDamageBonus from 'Parser/DeathKnight/Shared/getDamageBonus';

const SCOURGE_OF_WORLDS_BONUS = 0.3;

class ScourgeOfWorlds extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  }

  bonusDamage = 0;

  on_byPlayer_damage(event){
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SCOURGE_STRIKE.id && spellId !== SPELLS.SCOURGE_STRIKE_SHADOW_DAMAGE.id && spellId !== SPELLS.CLAWING_SHADOWS_TALENT.id){
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (enemy.hasBuff(SPELLS.SCOURGE_OF_WORLDS_DEBUFF.id, event.timestamp)) {
      this.bonusDamage += getDamageBonus(event, SCOURGE_OF_WORLDS_BONUS);
    }
  }

  statistic(){
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SCOURGE_OF_WORLDS.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDamage))}%`} 
        label={'Scourge of Worlds bonus damage'}
        tooltip={`Scourge of Worlds did ${formatNumber(this.bonusDamage)} (${this.owner.formatItemDamageDone(this.bonusDamage)})`}
        />
    );
  }
  statisticORder = STATISTIC_ORDER.CORE(8);
}

export default ScourgeOfWorlds;