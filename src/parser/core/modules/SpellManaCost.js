import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellResourceCost from 'parser/core/modules/SpellResourceCost';

class SpellManaCost extends SpellResourceCost {
  static resourceType = RESOURCE_TYPES.MANA;

  incorrectCosts = {};

  getHardcodedManaCost(event) {
    const spellId = event.ability.guid;
    const spell = SPELLS[spellId];
    return (spell && spell.manaCost) ? spell.manaCost : null;
  }

  getRawResourceCost(event) {
    const hardcodedCost = this.getHardcodedManaCost(event);
    const actualCost = this.getCostFromEventObject(event);

    if (hardcodedCost !== null && actualCost && hardcodedCost !== actualCost) {
      this.incorrectCosts[event.ability.guid] = {
        ...SPELLS[event.ability.guid],
        manaCost: undefined, // delete if it's set in SPELLS
        actualCost: actualCost,
        hardcodedCost: hardcodedCost,
      };
    }
    return hardcodedCost !== null ? hardcodedCost : actualCost;
  }

  getResourceCost(event) {
    const cost = super.getResourceCost(event);
    if (!cost || cost === 0) {
      return 0;
    }
    if (this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id, event.timestamp)) {
      return 0;
    }
    return cost;
  }

  on_finished() {
    const incorrectCostCount = Object.keys(this.incorrectCosts).length;
    if (incorrectCostCount === 0) {
      return;
    }

    console.warn(`There were ${incorrectCostCount} abilities that did not match their expected cost, see below for suggested values.`);
    Object.values(this.incorrectCosts).forEach(ability => console.warn(ability));
  }
}

export default SpellManaCost;
