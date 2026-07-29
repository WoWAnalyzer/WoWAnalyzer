import SPELLS from 'common/SPELLS/midnight/potions';
import Potion from 'parser/retail/modules/items/Potion';

/**
 * Tracks combat potion cooldown (DPS, HPS, mana, mitigation).
 */
class CombatPotion extends Potion {
  static spells = [
    SPELLS.ALLURING_NOSTRUM.id,
    SPELLS.LIQUID_LUSTER.id,
    SPELLS.LIGHTS_PRESERVATION.id,
    SPELLS.REFRESHING_SERUM.id,
    SPELLS.LIGHTS_POTENTIAL.id,
    SPELLS.LIGHTFUSED_MANA_POTION.id,
    SPELLS.POTION_OF_RECKLESSNESS.id,
    SPELLS.DRAUGHT_OF_RAMPANT_ABANDON.id,
    SPELLS.POTION_OF_ZEALOTRY.id,
    SPELLS.POTION_OF_DEVOURED_DREAMS.id,
  ];
  static recommendedEfficiency = 0;
  static extraAbilityInfo = {
    name: 'Combat Potion',
    buffSpellId: [
      SPELLS.ALLURING_NOSTRUM.id,
      SPELLS.LIQUID_LUSTER.id,
      SPELLS.LIGHTS_PRESERVATION.id,
      SPELLS.REFRESHING_SERUM.id,
      SPELLS.LIGHTS_POTENTIAL.id,
      SPELLS.LIGHTFUSED_MANA_POTION.id,
      SPELLS.POTION_OF_RECKLESSNESS.id,
      SPELLS.DRAUGHT_OF_RAMPANT_ABANDON.id,
      SPELLS.POTION_OF_ZEALOTRY.id,
      SPELLS.POTION_OF_DEVOURED_DREAMS.id,
    ],
  };
}

export default CombatPotion;
