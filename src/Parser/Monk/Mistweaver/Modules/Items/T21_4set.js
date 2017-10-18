import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import Module from 'Parser/Core/Module';

class T21_4set extends Module {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.CHIJIS_BATTLEGEAR_4_PIECE_BUFF.id);
  }

  item() {
    const chiBolt = this.abilityTracker.getAbility(SPELLS.CHI_BOLT.id);
    const healing = chiBolt.healingEffective;
    return {
      id: `spell-${SPELLS.CHIJIS_BATTLEGEAR_4_PIECE_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.CHIJIS_BATTLEGEAR_4_PIECE_BUFF.id} />,
      title: <SpellLink id={SPELLS.CHIJIS_BATTLEGEAR_4_PIECE_BUFF.id} />,
      result: (
        <span>
          {this.owner.formatItemHealingDone(healing)}
        </span>
      ),
    };
  }
}

export default T21_4set;
