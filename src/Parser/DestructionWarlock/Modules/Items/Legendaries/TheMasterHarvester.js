import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import SoulHarvest from '../../Talents/SoulHarvest';

class TheMasterHarvester extends Module {
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
      result: (
        <dfn data-tip={`Total bonus damage contributed: ${formatNumber(bonusDmg)}`}>
          {this.owner.formatItemDamageDone(bonusDmg)}
        </dfn>
      ),
    };
  }
}

export default TheMasterHarvester;
