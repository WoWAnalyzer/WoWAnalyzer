import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';

import Module from 'Parser/Core/Module';


class Tier20_2set extends Module {
  static dependencies = {
    combatants: Combatants,
  }

  item() {
    const T202setUptime = this.combatants.selected.getBuffUptime(SPELLS.ENHANCE_SHAMAN_T20_2SET_BONUS_BUFF.id) / this.owner.fightDuration;
    return {
      id: `spell-${SPELLS.ENHANCE_SHAMAN_T20_2SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.ENHANCE_SHAMAN_T20_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.ENHANCE_SHAMAN_T20_2SET_BONUS_BUFF.id} />,
      result: (
          `${formatPercentage(T202setUptime)}% uptime`
      ),
    };
  }

  suggestions(when) {
    const T202setUptime = this.combatants.selected.getBuffUptime(SPELLS.ENHANCE_SHAMAN_T20_2SET_BONUS_BUFF.id) / this.owner.fightDuration;
    when(T202setUptime).isLessThan(.95)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(`Your Tier 20 2pc buff uptime of ${formatPercentage(actual)}% is below 95%, try to get as close to 100% as possible`)
          .icon(SPELLS.ENHANCE_SHAMAN_T20_2SET_BONUS_BUFF.icon)
          .actual(`${formatPercentage(actual)}% uptime`)
          .recommended(`${(formatPercentage(recommended))}% is recommended`)
          .regular(recommended).major(recommended - 0.05);
      });
  }
}

export default Tier20_2set;
