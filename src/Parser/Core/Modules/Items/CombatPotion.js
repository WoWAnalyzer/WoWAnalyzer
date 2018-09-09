import SPELLS from 'common/SPELLS';
import Potion from './Potion';

const SPELL = [
  SPELLS.BATTLE_POTION_OF_STRENGTH,
  SPELLS.BATTLE_POTION_OF_AGILITY,
  SPELLS.BATTLE_POTION_OF_INTELLECT,
  SPELLS.BATTLE_POTION_OF_STAMINA,
  SPELLS.POTION_OF_RISING_DEATH,
  SPELLS.POTION_OF_BURSTING_BLOOD,
  SPELLS.STEELSKIN_POTION,
  SPELLS.COASTAL_MANA_POTION,
  SPELLS.COASTAL_REJUVENATION_POTION,
];
const RECOMMENDED_EFFICIENCY = 0;

/**
 * Tracks combat potion cooldown (DPS, HPS, mana, mitigation).
 */

class CombatPotion extends Potion {

  constructor(...args) {
    super(...args, SPELL, RECOMMENDED_EFFICIENCY);
  }
}

export default CombatPotion;
