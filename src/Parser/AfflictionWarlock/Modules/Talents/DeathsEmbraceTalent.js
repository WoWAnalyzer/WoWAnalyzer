import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import DeathsEmbrace from './DeathsEmbrace';

class DeathsEmbraceTalent extends Module {
  static dependencies = {
    deathsEmbrace : DeathsEmbrace,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.DEATHS_EMBRACE_TALENT.id);
  }

  statistic() {
    const bonusDmg = this.deathsEmbrace.bonusDmg;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DEATHS_EMBRACE_TALENT.id} />}
        value={`${formatNumber(bonusDmg / this.owner.fightDuration * 1000)} DPS`}
        label='Damage contributed'
        tooltip={`Your Death's Embrace talent contributed ${formatNumber(bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(bonusDmg))} %).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(3);
}

export default DeathsEmbraceTalent;
