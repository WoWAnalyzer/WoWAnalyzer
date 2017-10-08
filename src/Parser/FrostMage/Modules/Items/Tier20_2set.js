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
    const T202setUptime = this.combatants.selected.getBuffUptime(SPELLS.FROST_MAGE_T20_2SET_BONUS_BUFF.id) / this.owner.fightDuration;
    return {
      id: `spell-${SPELLS.FROST_MAGE_T20_2SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.FROST_MAGE_T20_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.FROST_MAGE_T20_2SET_BONUS_BUFF.id} />,
      result: (
          `${formatPercentage(T202setUptime)}% uptime`
      ),
    };
  }
}

export default Tier20_2set;
