import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import ItemDamageDone from 'Interface/Others/ItemDamageDone';

class MagistrikeRestraints extends Analyzer {
  bonusDmg = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasWrists(ITEMS.MAGISTRIKE_RESTRAINTS.id);
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
