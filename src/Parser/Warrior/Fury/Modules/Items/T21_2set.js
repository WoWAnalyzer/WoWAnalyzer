import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import Analyzer from 'Parser/Core/Analyzer';

class T21_2set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.WARRIOR_FURY_T21_2P_BONUS.id);
  }

  item() {
    const slaughter = this.abilityTracker.getAbility(SPELLS.WARRIOR_FURY_T21_2P_BONUS_DEBUFF.id);
    const damage = slaughter.damageEffective;

    return {
      id: `spell-${SPELLS.WARRIOR_FURY_T21_2P_BONUS_DEBUFF.id}`,
      icon: <SpellIcon id={SPELLS.WARRIOR_FURY_T21_2P_BONUS_DEBUFF.id} />,
      title: <SpellLink id={SPELLS.WARRIOR_FURY_T21_2P_BONUS_DEBUFF.id} />,
      result: this.owner.formatItemDamageDone(damage),
    };
  }
}

export default T21_2set;
