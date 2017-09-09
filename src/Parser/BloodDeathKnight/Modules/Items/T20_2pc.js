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
    this.active = this.combatants.selected.hasBuff(SPELLS.BLOOD_T20_2PC_GRAVEWARDEN.id);
    console.log('You have the 2pc');
  }

  item() {
    const T20_2PC_Uptime = this.owner.modules.combatants.getBuffUptime(SPELLS.BLOOD_T20_GRAVEWARDEN_BUFF.id);
    const T20_2PC_UptimePercentage = T20_2PC_Uptime / this.owner.fightDuration;
    return {
      id: `spell-${SPELLS.BLOOD_T20_2PC_GRAVEWARDEN.id}`,
      icon: <SpellIcon id={SPELLS.BLOOD_T20_2PC_GRAVEWARDEN.id} />,
      title: <SpellLink id={SPELLS.BLOOD_T20_2PC_GRAVEWARDEN.id} />,
      result: `Gravewarden uptime - ${formatPercentage(T20_2PC_UptimePercentage)} %`,
    };
  }
}

export default T20_2pc;
