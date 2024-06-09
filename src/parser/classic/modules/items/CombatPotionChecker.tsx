import Potion from 'parser/retail/modules/items/Potion';
import SPELLS from 'common/SPELLS/classic/potions';

const COMBAT_POTIONS: number[] = [
  SPELLS.EARTHEN_POTION.id,
  SPELLS.GOLEMBLOOD_POTION.id,
  SPELLS.MIGHTY_REJUVENATION_POTION.id,
  SPELLS.MOLOTOV_COCKTAIL.id,
  SPELLS.MYSTERIOUS_POTION.id,
  SPELLS.MYTHICAL_HEALING_POTION.id,
  SPELLS.MYTHICAL_MANA_POTION.id,
  SPELLS.POTION_OF_OGRE_RAGE.id,
  SPELLS.POTION_OF_PURE_GENIUS.id,
  SPELLS.POTION_OF_SPEED.id,
  SPELLS.POTION_OF_THE_COBRA.id,
  SPELLS.POTION_OF_THE_TOLVIR.id,
  SPELLS.VOLCANIC_POTION.id,
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
