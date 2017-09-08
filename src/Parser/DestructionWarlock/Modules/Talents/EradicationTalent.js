import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import Eradication from './Eradication';

class ReverseEntropy extends Module {
  static dependencies = {
    eradication: Eradication,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.ERADICATION_TALENT.id);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ERADICATION_TALENT.id} />}
        value={`${formatNumber(this.eradication.bonusDmg / this.owner.fightDuration * 1000)} DPS`}
        label='Damage contributed'
        tooltip={`Your Eradication talent contributed ${formatNumber(this.eradication.bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.eradication.bonusDmg))} %)`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(2);
}

export default ReverseEntropy;
