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
    if (!this.owner.error) {
      this.active = this.combatants.selected.hasChest(ITEMS.THE_MASTER_HARVESTER.id);
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
