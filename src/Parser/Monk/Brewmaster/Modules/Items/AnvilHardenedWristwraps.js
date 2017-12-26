import ITEMS from 'common/ITEMS';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';

class AnvilHardenedWristwraps extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  }

  wristsEquipped = false;
  dodgedHits = 0;

  on_initialized() {
    this.wristsEquipped = this.combatants.selected.hasWrists(ITEMS.ANVIL_HARDENED_WRISTWRAPS.id);
  }

  on_toPlayer_damage(event) {
    if (this.wristsEquipped && event.hitType === HIT_TYPES.DODGE) {
      this.dodgedHits += 1;
    } 
  }
}

export default AnvilHardenedWristwraps;
