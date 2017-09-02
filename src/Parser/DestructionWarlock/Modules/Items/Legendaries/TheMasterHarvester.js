import Module from 'Parser/Core/Module';

import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import SoulHarvest from '../../Talents/SoulHarvest';

class TheMasterHarvester extends Module {
  static dependencies = {
    soulHarvest: SoulHarvest,
  };

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasChest(ITEMS.THE_MASTER_HARVESTER.id);
    }
  }

  item() {
    const bonusDmg = this.soulHarvest.chestBonusDmg;
    return {
      item: ITEMS.THE_MASTER_HARVESTER,
      result: `${formatNumber(bonusDmg)} damage contributed - ${this.owner.formatItemDamageDone(bonusDmg)}`,
    };
  }
}

export default TheMasterHarvester;
