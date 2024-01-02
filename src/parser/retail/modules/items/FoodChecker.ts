import SPELLS from 'common/SPELLS/dragonflight/food';
import BaseFoodChecker from 'parser/shared/modules/items/FoodChecker';

const LOWER_FOOD_IDS: number[] = [
  // Dragonflight
  SPELLS.CHURNBELLY_TEA.id,
];

const MID_TIER_FOOD_IDS: number[] = [
  SPELLS.BRAISED_BRUFFALON_BRISKET.id,
  SPELLS.CHARRED_HORNSWOG_STEAKS.id,
  SPELLS.RIVERSIDE_PICNIC.id,
  SPELLS.ROAST_DUCK_DELIGHT.id,
  SPELLS.SALTED_MEAT_MASH.id,
  SPELLS.SCRAMBLED_BASILISK_EGGS.id,
  SPELLS.THRICE_SPICED_MAMMOTH_KABOB.id,
  SPELLS.HOPEFULLY_HEALTHY.id,
  SPELLS.SALT_BAKED_FISHCAKE.id,
  SPELLS.SEAMOTH_SURPRISE.id,
  SPELLS.TIMELY_DEMISE.id,
];

const HIGHER_FOOD_IDS: number[] = [
  SPELLS.AROMATIC_SEAFOOD_PLATTER.id,
  SPELLS.FIESTY_FISH_STICKS.id,
  SPELLS.GREAT_CERULEAN_SEA.id,
  SPELLS.REVENGE_SERVED_COLD.id,
  SPELLS.SIZZLING_SEAFOOD_MEDLEY.id,
  // SPELLS.YUSAS_HEARTY_STEW.id,
  SPELLS.FATED_FORTUNE_COOKIE.id,
  SPELLS.THOUSANDBONE_TONGUESLICER.id,
].filter((id) => id !== 0);

class FoodChecker extends BaseFoodChecker {
  get lowerFoodIds(): number[] {
    return LOWER_FOOD_IDS;
  }

  get midFoodIds(): number[] {
    return MID_TIER_FOOD_IDS;
  }

  get highFoodIds(): number[] {
    return HIGHER_FOOD_IDS;
  }
}
export default FoodChecker;
