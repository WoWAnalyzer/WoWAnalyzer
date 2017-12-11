import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import HotTracker from '../Core/HotTracker';

class T19_4Set extends Analyzer {
  static dependencies = {
    hotTracker: HotTracker,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.RESTO_DRUID_T19_4SET_BONUS_BUFF.id);
  }

  item() {
    const healing = this.hotTracker.t194p.healing;
    return {
      id: `spell-${SPELLS.RESTO_DRUID_T19_4SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.RESTO_DRUID_T19_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.RESTO_DRUID_T19_4SET_BONUS_BUFF.id} />,
      result: this.owner.formatItemHealingDone(healing),
    };
  }
}

export default T19_4Set;
