import Module from 'Parser/Core/Module';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import getDamageBonus from '../../WarlockCore/getDamageBonus';

const SACROLASH_DAMAGE_BONUS = .15;

class SacrolashsDarkStrike extends Module {
  bonusDmg = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasFinger(ITEMS.SACROLASHS_DARK_STRIKE.id);
    }
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.CORRUPTION_DEBUFF.id) {
      return;
    }
    this.bonusDmg += getDamageBonus(event, SACROLASH_DAMAGE_BONUS);
  }

  item() {
    return {
      item: ITEMS.SACROLASHS_DARK_STRIKE,
      result: `${formatNumber(this.bonusDmg)} damage - ${this.owner.formatItemDamageDone(this.bonusDmg)}`,
    };
  }
}

export default SacrolashsDarkStrike;
