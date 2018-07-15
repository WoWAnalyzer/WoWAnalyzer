import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

import Analyzer from 'Parser/Core/Analyzer';

class SpellManaCost extends Analyzer {
  incorrectCosts = {};

  on_byPlayer_cast(event) {
    // Manipulate the event to include mana information so that we don't have to copy paste this anywhere we want to know mana. This can't be done through static functions as some mana costs require state (through class properties) to work properly. E.g. Penance triggers up to 4 cast events but only the first costs mana.
    event.manaCost = this.getManaCost(event);
    event.rawManaCost = this.getRawManaCost(event);
    event.isManaCostNullified = this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id, event.timestamp);
  }

  getHardcodedManaCost(event) {
    const spellId = event.ability.guid;
    const spell = SPELLS[spellId];
    return spell && spell.manaCost ? spell.manaCost : null;
  }
  getRawManaCost(event) {
    const hardcodedCost = this.getHardcodedManaCost(event);
    const actualCost = event.classResources ? event.classResources.reduce((cost, resource) => {
      if (resource.type !== RESOURCE_TYPES.MANA.id) {
        return cost;
      }
      return cost + (resource.cost || 0);
    }, 0) : 0;

    if (hardcodedCost !== null && actualCost && hardcodedCost !== actualCost) {
      console.error(event.ability.name, event.ability.guid, 'The hardcoded cost', hardcodedCost, 'did not match the actual cost', actualCost);
      this.incorrectCosts[event.ability.guid] = {
        ...SPELLS[event.ability.guid],
        manaCost: actualCost,
      };
    }
    return hardcodedCost !== null ? hardcodedCost : actualCost;
  }

  getManaCost(event) {
    return this.getRawManaCost(event);
  }

  on_finished() {
    const incorrectCostCount = Object.keys(this.incorrectCosts).length;
    if (incorrectCostCount === 0) return;

    console.debug(`There were ${incorrectCostCount} abilities that did not match their expected cost, see below for suggested values.`);
    Object.entries(this.incorrectCosts).forEach(([, ability]) => {
      console.debug(ability);
    });
  }
}

export default SpellManaCost;
