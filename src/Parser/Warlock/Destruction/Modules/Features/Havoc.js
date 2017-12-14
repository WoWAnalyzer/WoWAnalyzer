import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

class Havoc extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  damage = 0;

  on_byPlayer_damage(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.HAVOC.id, event.timestamp)) {
      return;
    }

    this.damage += event.amount + (event.absorbed || 0);
  }

  // TODO: this could perhaps be reworked somehow to be more accurate but not sure how yet. Take it as a Havoc v1.0
  statistic() {
    if (this.damage===0){return;}
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HAVOC.id} />}
        value={`${formatNumber(this.damage / this.owner.fightDuration * 1000)} DPS`}
        label="Damage cleaved"
        tooltip={`You cleaved ${formatNumber(this.damage)} damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} %) to targets afflicted by your Havoc.<br /><br />Note: This number might be higher than it should be, as it also counts the damage you did directly to the Havoc target (not just the cleaved damage).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default Havoc;
