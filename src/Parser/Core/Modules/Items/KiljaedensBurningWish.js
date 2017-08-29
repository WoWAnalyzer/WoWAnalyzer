import Module from 'Parser/Core/Module';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

class KiljaedensBurningWish extends Module {
  bonusDmg = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.KILJAEDENS_BURNING_WISH.id);
    }
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.KILJAEDENS_BURNING_WISH_DAMAGE.id) {
      return;
    }
    this.bonusDmg += event.amount + (event.absorbed || 0);
  }

  item() {
    return {
      item: ITEMS.KILJAEDENS_BURNING_WISH,
      result: `${formatNumber(this.bonusDmg)} damage - ${this.owner.formatItemDamageDone(this.bonusDmg)}`,
    };
  }
}

export default KiljaedensBurningWish;
