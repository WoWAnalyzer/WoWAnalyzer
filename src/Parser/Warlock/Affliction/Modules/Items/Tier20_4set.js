import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

class Tier20_4set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.WARLOCK_AFFLI_T20_4P_BONUS.id);
  }

  item() {
    const uptime = this.combatants.selected.getBuffUptime(SPELLS.WARLOCK_AFFLI_T20_4P_BUFF.id) / this.owner.fightDuration;
    return {
      id: `spell-${SPELLS.WARLOCK_AFFLI_T20_4P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.WARLOCK_AFFLI_T20_4P_BONUS.id} />,
      title: <SpellLink id={SPELLS.WARLOCK_AFFLI_T20_4P_BONUS.id} icon={false} />,
      result: <span>{formatPercentage(uptime)} % uptime on <SpellLink id={SPELLS.WARLOCK_AFFLI_T20_4P_BUFF.id}/>.</span>,
    };
  }
}

export default Tier20_4set;
