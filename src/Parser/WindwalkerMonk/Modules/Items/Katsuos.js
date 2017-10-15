import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';

import Combatants from 'Parser/Core/Modules/Combatants';

const debug = false;

class Katsuos extends Module {
  static dependencies = {
    combatatants: Combatants,
  };
  chiSaved = 0; 
  

  on_initialized() {
    this.active = this.combatatants.selected.hasFeet(ITEMS.KATSUOS_ECLIPSE.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.FISTS_OF_FURY_CAST.id &&! this.combatatants.selected.hasBuff(SPELLS.SERENITY_TALENT.id)) {
      this.chiSaved += 1;
    }
  }

  item() {
    return {
      item: ITEMS.KATSUOS_ECLIPSE,
      result: `Chi saved: ${this.chiSaved}`,
    };
  }
}

export default Katsuos;
