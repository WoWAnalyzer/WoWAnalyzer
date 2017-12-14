import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import Analyzer from 'Parser/Core/Analyzer';

import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import Combatants from 'Parser/Core/Modules/Combatants';

class Restoration_Shaman_T21_4Set extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.RESTORATION_SHAMAN_T21_4SET_BONUS_BUFF.id);
  }

  item() {
    const healing = this.abilityTracker.getAbility(SPELLS.DOWNPOUR.id).healingEffective;

    return {
      id: `spell-${SPELLS.RESTORATION_SHAMAN_T21_4SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.RESTORATION_SHAMAN_T21_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.RESTORATION_SHAMAN_T21_4SET_BONUS_BUFF.id} />,
      result: this.owner.formatItemHealingDone(healing),
    };
  }

}

export default Restoration_Shaman_T21_4Set;
