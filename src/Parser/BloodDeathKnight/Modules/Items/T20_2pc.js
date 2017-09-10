import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

class T20_2pc extends Module {
  static dependencies = {
    combatants: Combatants,
  }


  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.BLOOD_DEATH_KNIGHT_T20_2SET_BONUS_BUFF.id);
  }

  item() {
    const uptime = this.owner.modules.combatants.getBuffUptime(SPELLS.GRAVEWARDEN.id);
    return {
      id: `spell-${SPELLS.BLOOD_DEATH_KNIGHT_T20_2SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.BLOOD_DEATH_KNIGHT_T20_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.BLOOD_DEATH_KNIGHT_T20_2SET_BONUS_BUFF.id} />,
      result: <span><SpellLink id={SPELLS.BLOOD_DEATH_KNIGHT_T20_2SET_BONUS_BUFF.id}>Gravewarden</SpellLink> {formatPercentage((uptime / this.owner.fightDuration) || 0)} % uptime</span>,
    };
  }
}

export default T20_2pc;
