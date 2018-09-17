import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

/**
 * Darkmoon Deck: Fathoms
 * Equip: Chance on attack to drop an anchor on your target, dealing damage to them. Size and damage of anchor depends on the topmost card of the deck.
 * Equip: Periodically shuffle the deck while in combat.
 */

class DarkmoonDeckFathoms extends Analyzer {
  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.DARKMOON_DECK_FATHOMS.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FATHOM_FALL.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  item() {
    return {
      item: ITEMS.DARKMOON_DECK_FATHOMS,
      result: (
        <React.Fragment>
          <ItemDamageDone amount={this.damage} />
        </React.Fragment>
      ),
    };
  }
}

export default DarkmoonDeckFathoms;
