import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import Eradication from '../../Talents/Eradication';

class SoulOfTheNetherlord extends Module {
  static dependencies = {
    eradication: Eradication,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_NETHERLORD.id);
  }

  item() {
    const bonusDmg = this.eradication.bonusDmg;
    return {
      item: ITEMS.SOUL_OF_THE_NETHERLORD,
      result: `${formatNumber(bonusDmg)} damage - ${this.owner.formatItemDamageDone(bonusDmg)}`,
    };
  }
}

export default SoulOfTheNetherlord;
