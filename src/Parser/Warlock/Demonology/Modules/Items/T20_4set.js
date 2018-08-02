import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

class T20_4set extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBuff(SPELLS.WARLOCK_DEMO_T20_4P_BONUS.id);
  }

  item() {
    const uptime = this.selectedCombatant.getBuffUptime(SPELLS.WARLOCK_DEMO_T20_4P_BUFF.id) / this.owner.fightDuration;
    return {
      id: `spell-${SPELLS.WARLOCK_DEMO_T20_4P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.WARLOCK_DEMO_T20_4P_BONUS.id} />,
      title: <SpellLink id={SPELLS.WARLOCK_DEMO_T20_4P_BONUS.id} icon={false} />,
      result: <span>{formatPercentage(uptime)} % uptime on <SpellLink id={SPELLS.WARLOCK_DEMO_T20_4P_BUFF.id} />.</span>,
    };
  }
}

export default T20_4set;
