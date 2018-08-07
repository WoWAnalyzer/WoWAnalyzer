import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import { formatNumber } from 'common/format';
import SCHOOLS from 'common/MAGIC_SCHOOLS';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

const PHYSICAL_DAMAGE_INCREASE = 0.20;

class RazorSpikes extends Analyzer {
//WCL: https://www.warcraftlogs.com/reports/rz6WxLbAmTgnFXQP/#fight=3&source=3

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RAZOR_SPIKES_TALENT.id);
  }

  on_toPlayer_damage(event) {
    // Physical
    if (event.ability.type !== SCHOOLS.ids.PHYSICAL) {
      return;
    }
    if (this.selectedCombatant.hasBuff(SPELLS.DEMON_SPIKES_BUFF.id, event.timestamp)) {
      this.damage += calculateEffectiveDamage(event,PHYSICAL_DAMAGE_INCREASE);
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RAZOR_SPIKES_TALENT.id} />}
        value={`${this.owner.formatItemDamageDone(this.damage)}`}
        label="Razor Spikes"
        tooltip={`This shows the extra dps that the talent provides.<br/>
                  <b>Total extra damage:</b> ${formatNumber(this.damage)}`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default RazorSpikes;
