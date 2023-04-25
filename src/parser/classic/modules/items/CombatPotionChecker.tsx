import Potion from 'parser/retail/modules/items/Potion';
import SPELLS from 'common/SPELLS/classic/potions';

export const COMBAT_POTIONS: number[] = [
  SPELLS.CRAZY_ALCHEMISTS_POTION.id,
  SPELLS.INDESTRUCTIBLE_POTION.id,
  SPELLS.MIGHTY_ARCANE_PROTECTION_POTION.id,
  SPELLS.MIGHTY_FIRE_PROTECTION_POTION.id,
  SPELLS.MIGHTY_FROST_PROTECTION_POTION.id,
  SPELLS.MIGHTY_NATURE_PROTECTION_POTION.id,
  SPELLS.MIGHTY_SHADOW_PROTECTION_POTION.id,
  SPELLS.POTION_OF_NIGHTMARES.id,
  SPELLS.POTION_OF_SPEED.id,
  SPELLS.POTION_OF_WILD_MAGIC.id,
  SPELLS.POWERFUL_REJUVENATION_POTION.id,
  SPELLS.RUNIC_HEALING_INJECTOR.id,
  SPELLS.RUNIC_HEALING_POTION.id,
  SPELLS.RUNIC_MANA_INJECTOR.id,
  SPELLS.RUNIC_MANA_POTION.id,
];

class CombatPotionChecker extends Potion {
  static spells = COMBAT_POTIONS;
  static recommendedEfficiency = 1;
  static extraAbilityInfo = {
    name: 'Combat Potion',
    buffSpellId: COMBAT_POTIONS,
  };
}

export default CombatPotionChecker;
