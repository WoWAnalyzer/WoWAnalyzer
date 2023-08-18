import SPELLS from 'common/SPELLS/dragonflight/potions';
import Potion from 'parser/retail/modules/items/Potion';

/**
 * Tracks combat potion cooldown (DPS, HPS, mana, mitigation).
 */
class CombatPotion extends Potion {
  static spells = [
    SPELLS.ELEMENTAL_POTION_OF_ULTIMATE_POWER.id,
    SPELLS.ELEMENTAL_POTION_OF_POWER.id,
    SPELLS.BOTTLED_PUTRESCENCE.id,
    SPELLS.POTION_OF_FROZEN_FOCUS.id,
    SPELLS.RESIDUAL_NEURAL_CHANNELING_AGENT.id,
    SPELLS.DELICATE_SUSPENSION_OF_SPORES.id,
    SPELLS.POTION_OF_CHILLED_CLARITY_R1.id,
    SPELLS.POTION_OF_CHILLED_CLARITY_R2.id,
    SPELLS.POTION_OF_CHILLED_CLARITY_R3.id,
    SPELLS.AERATED_MANA_POTION.id,
  ];
  static recommendedEfficiency = 0;
  static extraAbilityInfo = {
    name: 'Combat Potion',
    buffSpellId: [
      SPELLS.ELEMENTAL_POTION_OF_ULTIMATE_POWER.id,
      SPELLS.ELEMENTAL_POTION_OF_POWER.id,
      SPELLS.BOTTLED_PUTRESCENCE.id,
      SPELLS.POTION_OF_FROZEN_FOCUS.id,
      SPELLS.RESIDUAL_NEURAL_CHANNELING_AGENT.id,
      SPELLS.DELICATE_SUSPENSION_OF_SPORES.id,
      SPELLS.POTION_OF_CHILLED_CLARITY_R1.id,
      SPELLS.POTION_OF_CHILLED_CLARITY_R2.id,
      SPELLS.POTION_OF_CHILLED_CLARITY_R3.id,
      SPELLS.AERATED_MANA_POTION.id,
    ],
  };
}

export default CombatPotion;
