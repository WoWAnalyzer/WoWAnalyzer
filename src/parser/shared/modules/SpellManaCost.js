import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Events from 'parser/core/Events';
import SpellResourceCost from 'parser/shared/modules/SpellResourceCost';

import Expansion, { isRetailExpansion } from '../../../game/Expansion';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';

class SpellManaCost extends SpellResourceCost {
  static resourceType = RESOURCE_TYPES.MANA;

  incorrectCosts = {};

  constructor(options) {
    super(options);
    this.addEventListener(Events.fightend, this.onFightend);
  }

  getHardcodedManaCost(event) {
    const spellId = event.ability.guid;
    const spell = maybeGetTalentOrSpell(spellId);
    return spell && spell.manaCost ? spell.manaCost : null;
  }

  getRawResourceCost(event) {
    const hardcodedCost = this.getHardcodedManaCost(event);
    const actualCost = this.getCostFromEventObject(event);

    if (hardcodedCost !== null && actualCost && hardcodedCost !== actualCost) {
      const spell = maybeGetTalentOrSpell(event.ability.guid);
      this.incorrectCosts[event.ability.guid] = {
        ...spell,
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
    if (
      isRetailExpansion(this.owner.config.expansion) &&
      this.selectedCombatant.hasBuff(SPELLS.INNERVATE.id, event.timestamp)
    ) {
      return 0;
    }
    return cost;
  }

  onFightend() {
    const incorrectCostCount = Object.keys(this.incorrectCosts).length;
    if (incorrectCostCount === 0) {
      return;
    }

    console.warn(
      `There were ${incorrectCostCount} abilities that did not match their expected cost, see below for suggested values.`,
    );
    Object.values(this.incorrectCosts).forEach((ability) => console.warn(ability));
  }
}

export default SpellManaCost;
