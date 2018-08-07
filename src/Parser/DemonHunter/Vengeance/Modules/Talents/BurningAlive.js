import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

//WCL: https://www.warcraftlogs.com/reports/JxyY7HCDcjqMA9tf/#fight=1&source=15
class BurningAlive extends Analyzer {

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BURNING_ALIVE_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellID = event.ability.guid;
    if (spellID !== SPELLS.FIERY_BRAND_DOT.id) {
      return;
    }
    this.damage += event.amount;
  }



  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BURNING_ALIVE_TALENT.id} />}
        value={`${this.owner.formatItemDamageDone(this.damage)}`}
        label="Burning Alive"
        tooltip={`This shows the extra dps that the talent provides.<br/>
                  <b>Total extra damage:</b> ${formatNumber(this.damage)}`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default BurningAlive;
