import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import ItemDamageDone from 'Main/ItemDamageDone';

class MagistrikeRestraints extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.MAGISTRIKE_RESTRAINTS.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid === SPELLS.MAGISTRIKE_RESTRAINTS_CHAOS_BOLT.id) {
      this.bonusDmg += event.amount + (event.absorbed || 0);
    }
  }

  item() {
    return {
      item: ITEMS.MAGISTRIKE_RESTRAINTS,
      result: <ItemDamageDone amount={this.bonusDmg} />,
    };
  }
}

export default MagistrikeRestraints;
