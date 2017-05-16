import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';
import RESOURCE_TYPES from 'Parser/Core/RESOURCE_TYPES';

const debug = false;

class DarkmoonDeckPromises extends Module {
  manaGained = 0;
  casts = 0;

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
    let manaCost = this.getManaCost(event);
    if (!manaCost) {
      return;
    }
    const manaSaved = Math.min(this.currentManaReduction, manaCost);

    debug && console.log('Promises saved', manaSaved, 'mana on', SPELLS[spellId].name, 'costing', manaCost, event);
    this.manaGained += manaSaved;
    this.casts += 1;
  }
  getManaCost(event) {
    let cost = 0;

    event.classResources.forEach((resource) => {
      if (resource.type !== RESOURCE_TYPES.MANA) {
        return;
      }
      cost += resource.cost;
    });

    return cost;
  }
}

export default DarkmoonDeckPromises;
