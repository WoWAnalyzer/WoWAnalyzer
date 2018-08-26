import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

class LiquidMagmaTotem extends Analyzer {
  damageGained = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LIQUID_MAGMA_TOTEM_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.LIQUID_MAGMA_TOTEM_TALENT.id) {
      return;
    }
    this.damageGained += event.amount;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.LIQUID_MAGMA_TOTEM_TALENT.id} />}
        value={`${formatNumber(this.refund)}`}
        label="Maelstrom refunded"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default LiquidMagmaTotem;
