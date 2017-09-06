import React from 'react';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';

class savageRoarUptime extends Module {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SAVAGE_ROAR_TALENT.id);
  }

  suggestions(when) {
    const savageRoarUptime = this.combatants.selected.getBuffUptime(SPELLS.SAVAGE_ROAR_TALENT.id) / this.owner.fightDuration;

    when(savageRoarUptime).isLessThan(0.95)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.SAVAGE_ROAR_TALENT.id} /> uptime can be improved. Try to pay more attention to your bleeds on the Boss</span>)
          .icon(SPELLS.SAVAGE_ROAR_TALENT.icon)
          .actual(`${formatPercentage(actual)}% Savage Roar uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.10);
      });
  }

  statistic() {
    const savageRoarUptime = this.combatants.selected.getBuffUptime(SPELLS.SAVAGE_ROAR_TALENT.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SAVAGE_ROAR_TALENT.id} />}
        value={`${formatPercentage(savageRoarUptime)} %`}
        label='Savage Roar uptime'
    />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default savageRoarUptime;
