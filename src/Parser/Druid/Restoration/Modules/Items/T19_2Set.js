import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

import Mastery from '../Core/Mastery';

class T19_2Set extends Analyzer {
  static dependencies = {
    mastery: Mastery,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.RESTO_DRUID_T19_2SET_BONUS_BUFF.id);
  }

  item() {
    const healing = this.mastery.getBuffBenefit(SPELLS.ASTRAL_HARMONY.id);

    return {
      id: `spell-${SPELLS.RESTO_DRUID_T19_2SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.RESTO_DRUID_T19_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.RESTO_DRUID_T19_2SET_BONUS_BUFF.id} />,
      result: <ItemHealingDone amount={healing} />,
    };
  }
}

export default T19_2Set;
