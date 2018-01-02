import ITEMS from 'common/ITEMS';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import IronskinBrew from '../Spells/IronSkinBrew';

const WRISTS_REDUCTION = 1000;

class AnvilHardenedWristwraps extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    isb: IronskinBrew,
  }

  dodgedHits = 0;

  cdr = 0;
  wastedCDR = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.ANVIL_HARDENED_WRISTWRAPS.id);
  }

  on_toPlayer_damage(event) {
    if (event.hitType === HIT_TYPES.DODGE) {
      this.dodgedHits += 1;
      const actualReduction = this.isb.reduceCooldown(WRISTS_REDUCTION);
      this.cdr += actualReduction;
      this.wastedCDR += WRISTS_REDUCTION - actualReduction;
    } 
  }
}

export default AnvilHardenedWristwraps;
