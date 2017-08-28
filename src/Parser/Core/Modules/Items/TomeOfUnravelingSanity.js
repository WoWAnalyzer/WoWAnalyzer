import Module from 'Parser/Core/Module';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

class TomeOfUnravelingSanity extends Module {
  bonusDmg = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.TOME_OF_UNRAVELING_SANITY.id);
    }
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.TOME_OF_UNRAVELING_SANITY_DAMAGE.id) {
      return;
    }
    this.bonusDmg += event.amount + (event.absorbed || 0);
  }

  item() {
    return {
      item: ITEMS.TOME_OF_UNRAVELING_SANITY,
      result: `${formatNumber(this.bonusDmg)} damage - ${this.owner.formatItemDamageDone(this.bonusDmg)}`,
    };
  }
}

export default TomeOfUnravelingSanity;
