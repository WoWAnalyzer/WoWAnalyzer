import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';

import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import ItemDamageDone from 'Main/ItemDamageDone';

const CHAIN_OF_THRAYN_INCREASE = 0.1;

class ChainOfThrayn extends Analyzer {
  damageDone = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasWaist(ITEMS.CHAIN_OF_THRAYN.id);
  }

  on_byPlayer_damage(event) {
    if (event.targetIsFriendly) {
      // Friendly fire does not get increased
      return;
    }
    if (this.selectedCombatant.hasBuff(SPELLS.CRUSADE_TALENT.id) || this.selectedCombatant.hasBuff(SPELLS.AVENGING_WRATH.id)) {
      this.damageDone += calculateEffectiveDamage(event, CHAIN_OF_THRAYN_INCREASE);
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
