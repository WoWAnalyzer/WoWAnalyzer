import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';


class Tier20_2set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.ENHANCE_SHAMAN_T20_2SET_EQUIP.id);
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
    when(T202setUptime).isLessThan(0.80)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(`Your Tier 20 2pc buff uptime of ${formatPercentage(actual)}% is below 80%, 80% or better is ideal`)
          .icon(SPELLS.ENHANCE_SHAMAN_T20_2SET_BONUS_BUFF.icon)
          .actual(`${formatPercentage(actual)}% uptime`)
          .recommended(`${(formatPercentage(recommended, 0))}% is recommended`)
          .regular(recommended-0.09) //71-79 % is not a big deal
          .major(recommended - 0.1);
      });
  }
}

export default Tier20_2set;
