import SPELLS from 'common/SPELLS/midnight/potions';

import Potion from './Potion';

/**
 * Tracks health potion cooldown.
 */
class HealthPotion extends Potion {
  static spells = [
    SPELLS.CONCENTRATED_SILVERMOON_HEALTH_POTION.id,
    SPELLS.SILVERMOON_HEALTH_POTION.id,
    SPELLS.POTENT_HEALING_POTION.id,
    SPELLS.AMANI_EXTRACT.id,
    SPELLS.REFRESHING_SERUM.id,
  ];
  static recommendedEfficiency = 0;
  static extraAbilityInfo = {
    isDefensive: true,
  };
}

export default HealthPotion;
