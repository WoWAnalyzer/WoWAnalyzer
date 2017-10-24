import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

class SpectralThurible extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.SPECTRAL_THURIBLE.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.SPECTRAL_THURIBLE_DAMAGE.id) {
      return;
    }
    this.bonusDmg += event.amount + (event.absorbed || 0);
  }

  item() {
    return {
      item: ITEMS.SPECTRAL_THURIBLE,
      result: `${formatNumber(this.bonusDmg)} damage - ${this.owner.formatItemDamageDone(this.bonusDmg)}`,
    };
  }
}

export default SpectralThurible;
