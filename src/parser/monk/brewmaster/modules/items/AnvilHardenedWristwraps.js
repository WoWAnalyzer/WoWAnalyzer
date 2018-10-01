import ITEMS from 'common/ITEMS';
import HIT_TYPES from 'parser/core/HIT_TYPES';
import Analyzer from 'parser/core/Analyzer';
import SharedBrews from '../core/SharedBrews';

const WRISTS_REDUCTION = 1000;

class AnvilHardenedWristwraps extends Analyzer {
  static dependencies = {
    brews: SharedBrews,
  };

  dodgedHits = 0;

  cdr = 0;
  wastedCDR = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasWrists(ITEMS.ANVIL_HARDENED_WRISTWRAPS.id);
  }

  on_toPlayer_damage(event) {
    if (event.hitType === HIT_TYPES.DODGE) {
      this.dodgedHits += 1;
      const actualReduction = this.brews.reduceCooldown(WRISTS_REDUCTION);
      this.cdr += actualReduction;
      this.wastedCDR += WRISTS_REDUCTION - actualReduction;
    }
  }

  item() {
    return {
      item: ITEMS.ANVIL_HARDENED_WRISTWRAPS,
      result: `Brew cooldowns reduced by ${(this.cdr / 1000).toFixed(2)}s.`,
    };
  }
}

export default AnvilHardenedWristwraps;
