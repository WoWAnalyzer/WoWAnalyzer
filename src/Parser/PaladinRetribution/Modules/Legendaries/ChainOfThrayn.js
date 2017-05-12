import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES, AVENGING_WRATH_HEALING_INCREASE } from '../../Constants';

const CHAIN_OF_THRAYN_HEALING_INCREASE = 0.25;

class ChainOfThrayn extends Module {
  healing = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasWaist(ITEMS.CHAIN_OF_THRAYN.id);
    }
  }

  on_heal(event) {
    if (this.owner.byPlayer(event)) {
      this.processHeal(event);
    }
  }
  processHeal(event) {
    const spellId = event.ability.guid;
    if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1) {
      return;
    }

    if (!this.owner.selectedCombatant.hasBuff(SPELLS.AVENGING_WRATH.id, event.timestamp)) {
      return;
    }

    const amount = event.amount;
    const absorbed = event.absorbed || 0;
    const overheal = event.overheal || 0;
    const raw = amount + absorbed + overheal;
    const totalHealingIncreaseFactor = 1 + AVENGING_WRATH_HEALING_INCREASE + CHAIN_OF_THRAYN_HEALING_INCREASE;
    const totalHealingBeforeIncreases = raw / totalHealingIncreaseFactor;
    const regularAvengingWrathHealingIncreaseFactor = 1 + AVENGING_WRATH_HEALING_INCREASE;
    const totalHealingBeforeChainBonus = totalHealingBeforeIncreases * regularAvengingWrathHealingIncreaseFactor;
    const healingIncrease = raw - totalHealingBeforeChainBonus;

    const effectiveHealing = Math.max(0, healingIncrease - overheal);

    this.healing += effectiveHealing;
  }

  // Beacon transfer is included in `ABILITIES_AFFECTED_BY_HEALING_INCREASES`
}

export default ChainOfThrayn;
