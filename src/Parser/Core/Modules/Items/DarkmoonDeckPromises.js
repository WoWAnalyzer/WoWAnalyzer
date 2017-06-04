import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';

const debug = false;

class DarkmoonDeckPromises extends Module {
  manaGained = 0;

  priority = 9;
  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.DARKMOON_DECK_PROMISES.id);
    }
  }

  CARDS = { // Asuming 875
    191615: 610, // Ace
    191616: 838, // 2
    191617: 1067, // 3
    191618: 1296, // 4
    191619: 1524, // 5
    191620: 1752, // 6
    191621: 1981, // 7
    191622: 2438, // 8
  };
  currentManaReduction = 1438; // Start the fight at average, this should cause for the smallest discrepancy

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    const card = this.CARDS[spellId];
    if (!card) {
      return;
    }
    this.currentManaReduction = card;
  }

  lastPenanceStartTimestamp = null;
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const manaCost = event.manaCost;
    if (!manaCost) {
      return;
    }
    const manaSaved = Math.min(this.currentManaReduction, manaCost);
    if (!event.hasInnervate) {
      debug && console.log('Promises saved', manaSaved, 'mana on', SPELLS[spellId].name, 'costing', manaCost, event);
      this.manaGained += manaSaved;
    } else {
      debug && console.log('Promises saved 0 mana on', SPELLS[spellId].name, 'costing', manaCost, 'since Innervate is active (normally ', manaSaved, ' mana)', event);
    }

    // Update the mana cost on the cast so that it's accurate for other modules
    event.manaCost -= manaSaved;
  }
}

export default DarkmoonDeckPromises;
