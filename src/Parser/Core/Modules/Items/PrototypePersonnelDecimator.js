import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/*
 * Prototype Personnel Decimator -
 * Equip: Your ranged attacks and spells have a chance to launch a Homing Missile if your target is at least 10 yds away, dealing up to 243786 Fire damage to all enemies within 20 yds. Targets closer to the impact take more damage.
 */
class PrototypePersonnelDecimator extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.PROTOTYPE_PERSONNEL_DECIMATOR.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PROTOTYPE_PERSONNEL_DECIMATOR.id) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  item() {
    return {
      item: ITEMS.PROTOTYPE_PERSONNEL_DECIMATOR,
      result: this.owner.formatItemDamageDone(this.damage),
    };
  }
}

export default PrototypePersonnelDecimator;
