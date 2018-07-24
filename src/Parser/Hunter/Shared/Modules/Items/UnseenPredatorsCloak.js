import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import ITEMS from 'common/ITEMS/index';
import getDamageBonus from 'Parser/Core/calculateEffectiveDamage';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

/**
 * Unseen Predator's Cloak
 * Equip: Increases all damage done by 3%.
 */

const UNSEEN_MODIFIER = 0.03;

class UnseenPredatorsCloak extends Analyzer {

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBack(ITEMS.UNSEEN_PREDATORS_CLOAK.id);
  }

  on_byPlayer_damage(event) {
    if (event.targetIsFriendly) {
      // Friendly fire does not get increased
      return;
    }
    this.damage += getDamageBonus(event, UNSEEN_MODIFIER);
  }

  item() {
    return {
      item: ITEMS.UNSEEN_PREDATORS_CLOAK,
      result: <ItemDamageDone amount={this.damage} />,
    };
  }
}

export default UnseenPredatorsCloak;
