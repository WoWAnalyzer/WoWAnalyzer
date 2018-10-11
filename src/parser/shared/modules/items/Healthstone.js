import SPELLS from 'common/SPELLS/index';

import Potion from './Potion';

/**
 * Tracks Healthstone cooldown.
 */
class Healthstone extends Potion {
  static spells = [
    SPELLS.HEALTHSTONE,
  ];
  static recommendedEfficiency = 0;
  static extraAbilityInfo = {
    isDefensive: true,
  };
}

export default Healthstone;
