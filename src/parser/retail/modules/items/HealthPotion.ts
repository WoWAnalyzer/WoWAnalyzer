import SPELLS from 'common/SPELLS/thewarwithin/potions';

import Potion from './Potion';

/**
 * Tracks health potion cooldown.
 */
class HealthPotion extends Potion {
  static spells = [SPELLS.ALGARI_HEALING_POTION.id];
  static recommendedEfficiency = 0;
  static extraAbilityInfo = {
    isDefensive: true,
  };
}

export default HealthPotion;
