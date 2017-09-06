import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

class TerrorFromBelow extends Module {
  static dependencies = {
    combatants: Combatants,
  };
  bonusDmg = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.combatants.selected.hasTrinket(ITEMS.TERROR_FROM_BELOW.id);
    }
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.TERROR_FROM_BELOW_DAMAGE.id) {
      return;
    }
    // The trinket can damage damage to the player as well if he's near the mobs, count only the damage to enemy targets
    if (!event.targetIsFriendly) {
      this.bonusDmg += event.amount + (event.absorbed || 0);
    }
  }

  item() {
    return {
      item: ITEMS.TERROR_FROM_BELOW,
      result: `${formatNumber(this.bonusDmg)} damage - ${this.owner.formatItemDamageDone(this.bonusDmg)}`,
    };
  }
}

export default TerrorFromBelow;
