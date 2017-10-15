import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

class ShatteredFragmentsOfSindragosa extends Module {

  static dependencies = {
		combatants: Combatants,
	};

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasHead(ITEMS.SHATTERED_FRAGMENTS_OF_SINDRAGOSA.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.COMET_STORM_DAMAGE.id) {
      return;
    }
      this.damage += event.amount;
  }

  item() {
    return {
      item: ITEMS.SHATTERED_FRAGMENTS_OF_SINDRAGOSA,
      result: `${this.owner.formatItemDamageDone(this.damage)}`,
    };
  }
}

export default ShatteredFragmentsOfSindragosa;
