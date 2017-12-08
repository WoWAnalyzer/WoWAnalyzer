import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/*
 * Forgefiend's Fabricator -
 * Equip: Your melee and ranged attacks have a chance to plant Fire Mines at the enemy's feet. Fire Mines detonate after 15 sec, inflicting 63094 Fire damage to all enemies within 12 yds.
 * Use: Detonate all Fire Mines. (30 Sec Cooldown)
 */
class ForgefiendsFabricator extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.FORGEFIENDS_FABRICATOR.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.FIRE_MINES.id) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  item() {
    return {
      item: ITEMS.FORGEFIENDS_FABRICATOR,
      result: this.owner.formatItemDamageDone(this.damage),
    };
  }
}

export default ForgefiendsFabricator;
