import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import ItemDamageDone from 'Main/ItemDamageDone';

const SOUL_HARVEST_DAMAGE_BONUS = 0.2;

class TheMasterHarvester extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasChest(ITEMS.THE_MASTER_HARVESTER.id);
  }

  on_byPlayer_damage(event) {
    if (this.combatants.selected.hasBuff(SPELLS.SOUL_HARVEST.id, event.timestamp)) {
      this.bonusDmg += calculateEffectiveDamage(event, SOUL_HARVEST_DAMAGE_BONUS);
    }
  }

  on_byPlayerPet_damage(event) {
    if (this.combatants.selected.hasBuff(SPELLS.SOUL_HARVEST.id, event.timestamp)) {
      this.bonusDmg += calculateEffectiveDamage(event, SOUL_HARVEST_DAMAGE_BONUS);
    }
  }

  item() {
    return {
      item: ITEMS.THE_MASTER_HARVESTER,
      result: <ItemDamageDone amount={this.bonusDmg} />,
    };
  }
}

export default TheMasterHarvester;
