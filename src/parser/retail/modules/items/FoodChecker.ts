import SHADOWLANDS_SPELLS from 'common/SPELLS/shadowlands/others';
import SPELLS from 'common/SPELLS/dragonflight/food';
import BaseFoodChecker from 'parser/shared/modules/items/FoodChecker';

const LOWER_FOOD_IDS: number[] = [
  // Shadowlands Food
  SHADOWLANDS_SPELLS.SURPRISINGLY_PALATABLE_FEAST_INT.id,
  SHADOWLANDS_SPELLS.SURPRISINGLY_PALATABLE_FEAST_AGI.id,
  SHADOWLANDS_SPELLS.SURPRISINGLY_PALATABLE_FEAST_STR.id,
  SHADOWLANDS_SPELLS.PICKLED_MEAT_SMOOTHIE.id,
  SHADOWLANDS_SPELLS.BUTTERSCOTCH_MARINATED_RIBS.id,
  SHADOWLANDS_SPELLS.CINNAMON_BONEFISH_STEW.id,
  SHADOWLANDS_SPELLS.MEATY_APPLE_DUMPLINGS.id,
  SHADOWLANDS_SPELLS.SWEET_SILVERGILL_SAUSAGES.id,
  SHADOWLANDS_SPELLS.FEAST_OF_GLUTTONOUS_HEDONISM_INT.id,
  SHADOWLANDS_SPELLS.FEAST_OF_GLUTTONOUS_HEDONISM_AGI.id,
  SHADOWLANDS_SPELLS.FEAST_OF_GLUTTONOUS_HEDONISM_STR.id,
  SHADOWLANDS_SPELLS.BANANA_BEEF_PUDDING.id,
  SHADOWLANDS_SPELLS.SPINEFIN_SOUFFLE_AND_FRIES.id,
  SHADOWLANDS_SPELLS.TENEBROUS_CROWN_ROAST_ASPIC.id,
  SHADOWLANDS_SPELLS.IRIDESCENT_RAVIOLI_WITH_APPLE_SAUCE.id,
  SHADOWLANDS_SPELLS.STEAK_A_LA_MODE.id,
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
