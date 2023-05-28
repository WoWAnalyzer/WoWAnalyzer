import SPELLS from 'common/SPELLS/dragonflight/potions';

import Potion from './Potion';

/**
 * Tracks health potion cooldown.
 */
class HealthPotion extends Potion {
  static spells = [SPELLS.REFRESHING_HEALING_POTION.id, SPELLS.POTION_OF_WITHERING_VITALITY.id];
  static recommendedEfficiency = 0;
  static extraAbilityInfo = {
    isDefensive: true,
  };
}

export default HealthPotion;
