import SPELLS from 'common/SPELLS';

import Potion from './Potion';

/**
 * Tracks health potion cooldown.
 */
class HealthPotion extends Potion {
  static spells = [SPELLS.SPIRITUAL_HEALING_POTION.id, SPELLS.COSMIC_HEALING_POTION.id];
  static recommendedEfficiency = 0;
  static extraAbilityInfo = {
    isDefensive: true,
  };
}

export default HealthPotion;
