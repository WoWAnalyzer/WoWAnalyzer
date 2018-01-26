import React from 'react';

import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemDamageDone from 'Main/ItemDamageDone';

import SoulHarvest from '../../Talents/SoulHarvest';

class TheMasterHarvester extends Analyzer {
  static dependencies = {
    soulHarvest: SoulHarvest,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasChest(ITEMS.THE_MASTER_HARVESTER.id);
  }

  item() {
    const bonusDmg = this.soulHarvest.chestBonusDmg;
    return {
      item: ITEMS.THE_MASTER_HARVESTER,
      result: <ItemDamageDone amount={bonusDmg} />,
    };
  }
}

export default TheMasterHarvester;
