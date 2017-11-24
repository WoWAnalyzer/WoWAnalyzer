import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import getDamageBonus from 'Parser/Mage/Shared/Modules/GetDamageBonus';

const DAMAGE_BONUS = 1;

class DarcklisDragonfireDiadem extends Analyzer {

  static dependencies = {
		combatants: Combatants,
	};

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasHead(ITEMS.DARCKLIS_DRAGONFIRE_DIADEM.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.DRAGONS_BREATH.id) {
      return;
    }
      this.damage += getDamageBonus(event, DAMAGE_BONUS);
  }

  item() {
    return {
      item: ITEMS.DARCKLIS_DRAGONFIRE_DIADEM,
      result: this.owner.formatItemDamageDone(this.damage),
    };
  }
}

export default DarcklisDragonfireDiadem;
