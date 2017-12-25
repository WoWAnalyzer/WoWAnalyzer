import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

/**
 * TODO:
 * - Number of enemys with debuff
 */
class LightningRod extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  lightningRodDamage=0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.LIGHTNING_ROD_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid===SPELLS.LIGHTNING_ROD_DAMAGE.id){
      this.lightningRodDamage+=event.amount+(event.absorbed || 0);
    }
  }

  get getPercentageUptime() {
    return this.enemies.getBuffUptime(SPELLS.LIGHTNING_ROD_DEBUFF.id) / this.owner.fightDuration;
  }

  get getDamagePerSecond() {
    return this.lightningRodDamage/this.owner.fightDuration*1000;
  }

  statistic() {
    return (
      <StatisticBox icon={<SpellIcon id={SPELLS.LIGHTNING_ROD_TALENT.id} />}
        value={(
          <span>
            {`${formatPercentage(this.getPercentageUptime)} %`}<br/>
            {`${formatNumber(this.getDamagePerSecond)} DPS`}{' '}
          </span>
        )}
        label="Lightning Rod Uptime/DPS"
        tooltip={`DPS and Uptime of the Lightning Rod Talent.</li></ul>`} />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default LightningRod;
