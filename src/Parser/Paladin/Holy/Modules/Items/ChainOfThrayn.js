import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES, AVENGING_WRATH_HEALING_INCREASE } from '../../Constants';

const CHAIN_OF_THRAYN_HEALING_INCREASE = 0.25;

class ChainOfThrayn extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWaist(ITEMS.CHAIN_OF_THRAYN.id);
  }

  on_heal(event) {
    if (this.owner.byPlayer(event)) {
      this.processHeal(event);
    }
  }
  processHeal(event) {
    const spellId = event.ability.guid;
    if (!ABILITIES_AFFECTED_BY_HEALING_INCREASES.includes(spellId)) {
      return;
    }

    if (!this.combatants.selected.hasBuff(SPELLS.AVENGING_WRATH.id, event.timestamp)) {
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

  item() {
    return {
      item: ITEMS.CHAIN_OF_THRAYN,
      result: <ItemHealingDone amount={this.healing} />,
    };
  }
}

export default ChainOfThrayn;
