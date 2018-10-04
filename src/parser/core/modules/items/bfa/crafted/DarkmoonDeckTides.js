import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'parser/core/Analyzer';
import ItemHealingDone from 'interface/others/ItemHealingDone';
import ItemManaGained from 'interface/others/ItemManaGained';

const DARKMOON_DECK_TIDES_CARDS = [
  276136, // Ace
  276137, // 2
  276138, // 3
  276139, // 4
  276140, // 5
  276141, // 6
  276142, // 7
  276143, // 8
];

/**
 * Darkmoon Deck: Tides -
 * Equip: Restores a moderate amount of mana when the deck is shuffled. Chance to throw a card to a random party member,
 * healing them and bouncing to other party members. Amount of mana restored and number of bounces depends on the topmost card in the deck.
 * Equip: Periodically shuffle the deck while in combat.
 */

class DarkmoonDeckTides extends Analyzer {
  healing = 0;
  manaGained = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.DARKMOON_DECK_TIDES.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.REJUVENATING_TIDES.id) {
      return;
    }

    this.healing += event.amount + (event.absorbed || 0);
  }

  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (!DARKMOON_DECK_TIDES_CARDS.includes(spellId)) {
      return;
    }

    this.manaGained += event.resourceChange;
  }

  item() {
    return {
      item: ITEMS.DARKMOON_DECK_TIDES,
      result: (
        <React.Fragment>
          <ItemHealingDone amount={this.healing} /><br />
          <ItemManaGained amount={this.manaGained} />
        </React.Fragment>
      ),
    };
  }
}

export default DarkmoonDeckTides;
