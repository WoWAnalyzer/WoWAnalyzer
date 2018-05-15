import React from 'react';

import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Combatants from 'Parser/Core/Modules/Combatants';
import CritEffectBonus from 'Parser/Core/Modules/Helpers/CritEffectBonus';
import ItemHealingDone from 'Main/ItemHealingDone';

export const DRAPE_OF_SHAME_CRIT_EFFECT = 0.05;

/**
 * Drape of Shame
 * Equip: Increases the healing of your critical healing effects by 5%.
 */
class DrapeOfShame extends Analyzer {
  static dependencies = {
    critEffectBonus: CritEffectBonus,
    combatants: Combatants,
  };
  baseStats = {
    itemLevel: 825,
    primary: 606,
    stamina: 910,
    criticalStrike: 260,
    versatility: 400,
  };

  healing = 0;
  equippedItem = null;

  on_initialized() {
    this.equippedItem = this.combatants.selected.getItem(ITEMS.DRAPE_OF_SHAME.id);
    this.active = !!this.equippedItem;

    if (this.active) {
      this.critEffectBonus.hook(this.getCritEffectBonus);
    }
  }

  getCritEffectBonus(critEffectModifier, event) {
    if (!this.owner.constructor.abilitiesAffectedByHealingIncreases.includes(event.ability.guid)) {
      return critEffectModifier;
    }

    return critEffectModifier + DRAPE_OF_SHAME_CRIT_EFFECT;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (!this.owner.constructor.abilitiesAffectedByHealingIncreases.includes(spellId)) {
      return;
    }
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }

    const amount = event.amount;
    const absorbed = event.absorbed || 0;
    const overheal = event.overheal || 0;
    const raw = amount + absorbed + overheal;
    const rawNormalPart = raw / this.critEffectBonus.getBonus(event);
    const rawDrapeHealing = rawNormalPart * DRAPE_OF_SHAME_CRIT_EFFECT;

    const effectiveHealing = Math.max(0, rawDrapeHealing - overheal);

    this.healing += effectiveHealing;
  }

  item() {
    return {
      item: ITEMS.DRAPE_OF_SHAME,
      result: <ItemHealingDone amount={this.healing} />,
    };
  }
}

export default DrapeOfShame;
