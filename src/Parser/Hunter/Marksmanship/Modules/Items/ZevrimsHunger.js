import React from 'react';

import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * Zevrim's Hunger
 * Equip: Increases all damage done by 3%
 */

const ZEVRIMS_MODIFIER = 0.03;

class ZevrimsHunger extends Analyzer {

  damage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasFinger(ITEMS.ZEVRIMS_HUNGER.id);
  }

  on_byPlayer_damage(event) {
    if (event.targetIsFriendly) {
      // Friendly fire does not get increased
      return;
    }
    this.damage += getDamageBonus(event, ZEVRIMS_MODIFIER);
  }

  item() {
    return {
      item: ITEMS.ZEVRIMS_HUNGER,
      result: <ItemDamageDone amount={this.bonusDmg} />,
    };
  }
}

export default ZevrimsHunger;
