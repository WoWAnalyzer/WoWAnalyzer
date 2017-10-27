import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

import Combatants from 'Parser/Core/Modules/Combatants';

class KatsuosEclipse extends Analyzer {
  static dependencies = {
    combatatants: Combatants,
  };
  chiSaved = 0; 
  

  on_initialized() {
    this.active = this.combatatants.selected.hasFeet(ITEMS.KATSUOS_ECLIPSE.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.FISTS_OF_FURY_CAST.id && !this.combatatants.selected.hasBuff(SPELLS.SERENITY_TALENT.id, event.timestamp)) {
      this.chiSaved += 1;
    }
  }

  item() {
    return {
      item: ITEMS.KATSUOS_ECLIPSE,
      result: `${this.chiSaved} Chi saved`,
    };
  }
}

export default KatsuosEclipse;
