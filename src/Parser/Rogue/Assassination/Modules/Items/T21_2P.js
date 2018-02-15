import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatPercentage } from 'common/format';

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
      icon: <SpellIcon id={SPELLS.ASSA_ROGUE_T21_2SET_BONUS.id} />,
      title: <SpellLink id={SPELLS.ASSA_ROGUE_T21_2SET_BONUS.id} />,
      result: (
        <dfn data-tip={`It's worth keeping this in mind and trying to maximize your uptime, but not at the expense of your primary rotation. This should, most of the time, naturally happen in the process of clipping your Envenom debuff.`}>
          {formatPercentage(this.percentUptime)}% <SpellLink id={SPELLS.ASSA_ROGUE_T21_2SET_BONUS_BUFF.id} icon /> uptime
        </dfn>
      ),
    };
  }
}

export default T21_2P;
