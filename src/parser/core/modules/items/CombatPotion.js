import SPELLS from 'common/SPELLS';

import Potion from './Potion';

/**
 * Tracks combat potion cooldown (DPS, HPS, mana, mitigation).
 */
class CombatPotion extends Potion {
  static spells = [
    SPELLS.BATTLE_POTION_OF_INTELLECT,
    SPELLS.BATTLE_POTION_OF_STRENGTH,
    SPELLS.BATTLE_POTION_OF_AGILITY,
    SPELLS.BATTLE_POTION_OF_STAMINA,
    SPELLS.POTION_OF_RISING_DEATH,
    SPELLS.POTION_OF_BURSTING_BLOOD,
    SPELLS.STEELSKIN_POTION,
    SPELLS.COASTAL_MANA_POTION,
    SPELLS.COASTAL_REJUVENATION_POTION,
  ];
  static recommendedEfficiency = 0;
  // TODO: Add to buffSpellId so their uptime is shown on the timeline, but this requires changing buffSpellId to support receiving an array
}

export default CombatPotion;
