import React from 'react';

import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import ItemHealingDone from 'Interface/Others/ItemHealingDone';

const DARKMOON_DECK_BLOCKADES_CARDS = [
  276204, // Ace
  276205, // 2
  276206, // 3
  276207, // 4
  276208, // 5
  276209, // 6
  276210, // 7
  276211, // 8
];
/**
 * Darkmoon Deck: Blockades
 * Equip: Whenever the deck is shuffled, heal a small amount of health and gain additional stamina. Amount of both stamina and healing depends on the topmost card of the deck.
 * Equip: Periodically shuffle the deck while in combat.
 *
 * Example: https://www.warcraftlogs.com/reports/j7XQrN8LcJKw1qM3#fight=29&source=1&type=healing&view=timeline
 */

class DarkmoonDeckBlockades extends Analyzer {
  healing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.DARKMOON_DECK_BLOCKADES.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (!DARKMOON_DECK_BLOCKADES_CARDS.includes(spellId)) {
      return;
    }
    this.healing += (event.amount || 0) + (event.absorbed || 0);
  }

  item() {
    return {
      item: ITEMS.DARKMOON_DECK_BLOCKADES,
      result:(
        <React.Fragment>
          <ItemHealingDone amount={this.healing} />
        </React.Fragment>
      ),
    };
  }
}

export default DarkmoonDeckBlockades;
