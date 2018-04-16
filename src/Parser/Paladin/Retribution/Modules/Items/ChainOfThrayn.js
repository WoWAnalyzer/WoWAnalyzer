import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import GetDamageBonus from 'Parser/Paladin/Shared/Modules/GetDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

const CHAIN_OF_THRAYN_INCREASE = 0.1;

class ChainOfThrayn extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damageDone = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWaist(ITEMS.CHAIN_OF_THRAYN.id);
  }

  on_byPlayer_damage(event) {
    if (event.targetIsFriendly) {
      // Friendly fire does not get increased
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.CRUSADE_TALENT.id) || this.combatants.selected.hasBuff(SPELLS.AVENGING_WRATH.id)) {
      this.damageDone += GetDamageBonus(event, CHAIN_OF_THRAYN_INCREASE);
    }
  }

  item() {
    return {
      item: ITEMS.CHAIN_OF_THRAYN,
      result: <ItemDamageDone amount={this.damageDone} />,
    };
  }
}

export default ChainOfThrayn;
