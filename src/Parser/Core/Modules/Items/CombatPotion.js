import SPELLS from 'common/SPELLS';
import Potion from './Potion';

const SPELL = [
  SPELLS.POTION_OF_PROLONGED_POWER,
  SPELLS.POTION_OF_DEADLY_GRACE,
  SPELLS.POTION_OF_THE_OLD_WAR,
  SPELLS.ANCIENT_MANA_POTION,
  SPELLS.LEYTORRENT_POTION,
  SPELLS.UNBENDING_POTION,
  SPELLS.SPIRIT_BERRIES,
  SPELLS.COASTAL_MANA_POTION,
];
const RECOMMENDED_EFFICIENCY = 0;

/**
 * Tracks combat potion cooldown (DPS, HPS, mana, mitigation).
 */

class Healthstone extends Potion {

  constructor(...args) {
    super(...args, SPELL, RECOMMENDED_EFFICIENCY);
  }
}

export default Healthstone;
