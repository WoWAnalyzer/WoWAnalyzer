import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatPercentage } from 'common/format';

/**
* Equip: When you use Envenom, your Deadly and Wound poisons have 35% increased chance to critically strike for 6 sec.
*/

class T21_2P extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  get percentUptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.ASSA_ROGUE_T21_2SET_BONUS_BUFF.id) / this.owner.fightDuration;
  }

  item() {
    return {
      id: SPELLS.ASSA_ROGUE_T21_2SET_BONUS_BUFF.id,
      icon: <SpellIcon id={SPELLS.ASSA_ROGUE_T21_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.ASSA_ROGUE_T21_2SET_BONUS_BUFF.id} />,
      result: (
        <dfn data-tip={`Ideally you should be aiming for somewhere around 80% uptime. This should, most of the time, naturally happen in the process of clipping your Envenom debuff; do not chase higher uptime on this at the expense of your regular rotation.`}>
          {formatPercentage(this.percentUptime)}% <SpellLink id={SPELLS.ASSA_ROGUE_T21_2SET_BONUS_BUFF.id} icon /> uptime
        </dfn>
      ),
    };
  }
}

export default T21_2P;
