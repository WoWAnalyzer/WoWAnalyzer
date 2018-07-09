import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import ItemHealingDone from 'Main/ItemHealingDone';

/**
 * Roots of Shaladrassil
 * Equip: Standing still causes you to send deep roots into the ground, healing you for 3% of your maximum health every 1 sec.
 */
class RootsOfShaladrassil extends Analyzer {
  healing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasLegs(ITEMS.ROOTS_OF_SHALADRASSIL.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.ROOTS_OF_SHALADRASSIL_HEAL.id) {
      this.healing += event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.ROOTS_OF_SHALADRASSIL,
      result: <ItemHealingDone amount={this.healing} />,
    };
  }
}

export default RootsOfShaladrassil;
