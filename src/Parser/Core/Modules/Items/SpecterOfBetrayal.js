import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/*
 * Scepter of Betrayal -
 * Use: Create a Dread Reflection at your location for 1 min and cause each of your Dread Reflections to unleash a torrent of magic that deals (111484 * 4) Shadow damage over 3 sec, split evenly among nearby enemies. (45 Sec Cooldown)
 */
class SpecterOfBetrayal extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.SPECTER_OF_BETRAYAL.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DREAD_TORRENT.id) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  item() {
    return {
      item: ITEMS.SPECTER_OF_BETRAYAL,
      result: this.owner.formatItemDamageDone(this.damage),
    };
  }
}

export default SpecterOfBetrayal;
