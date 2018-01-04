import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import getDamageBonus from 'Parser/Mage/Shared/Modules/GetDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

const DAMAGE_BONUS = .35;

class ZannesuJourney extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;
  stackCount = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWaist(ITEMS.ZANNESU_JOURNEY.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.BLIZZARD.id) {
      return;
    }
    const buff = this.combatants.selected.getBuff(SPELLS.ZANNESU_JOURNEY_BUFF.id);
    this.stackCount = (buff && buff.stacks) || 0;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.BLIZZARD_DAMAGE.id) {
      return;
    }
    this.damage += getDamageBonus(event, DAMAGE_BONUS * this.stackCount);
  }

  item() {
    return {
      item: ITEMS.ZANNESU_JOURNEY,
      result: <ItemDamageDone amount={this.damage} />,
    };
  }
}

export default ZannesuJourney;
