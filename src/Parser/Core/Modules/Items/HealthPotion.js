import SPELLS from 'common/SPELLS';
import Potion from './Potion';

const SPELL = [
  SPELLS.ASTRAL_HEALING_POTION,
  SPELLS.ANCIENT_HEALING_POTION,
];
const RECOMMENDED_EFFICIENCY = 0;

/**
 * Tracks health potion cooldown.
 */

class Healthstone extends Potion {

  constructor(...args) {
    super(...args, SPELL, RECOMMENDED_EFFICIENCY);
  }
}

export default Healthstone;
