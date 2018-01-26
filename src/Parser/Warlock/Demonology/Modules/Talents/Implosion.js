import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

class Implosion extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  impsKilled = 0;
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.IMPLOSION_TALENT.id);
  }

  on_byPlayer_instakill(event) {
    if (event.ability.guid !== SPELLS.IMPLOSION_DAMAGE.id) {
      return;
    }
    this.impsKilled += 1;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.IMPLOSION_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.IMPLOSION_TALENT.id} />}
        value={`${formatNumber(this.damage / this.owner.fightDuration * 1000)} DPS`}
        label="Implosion damage"
        tooltip={`Your Implosion did ${formatNumber(this.damage)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} %) and killed ${this.impsKilled} Wild Imps.`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(1);
}

export default Implosion;
