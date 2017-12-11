import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/*
 * Sheath of Asara -
 * Equip: Your damaging spells have a chance to conjure 6 Shadow Blades. After 2 sec, the swords begin launching foward, each dealing 500 Shadow damage to the first enemy in their path and increasing damage taken from your subsequent Shadow Blades by 10% for 3 sec, up to 50%.
 */
class SheathOfAsara extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.SHEATH_OF_ASARA.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SHEATH_OF_ASARA_SHADOW_BLADES.id) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  item() {
    return {
      item: ITEMS.SHEATH_OF_ASARA,
      result: this.owner.formatItemDamageDone(this.damage),
    };
  }
}

export default SheathOfAsara;
