import SPELLS from 'common/SPELLS/thewarwithin/food';
import BaseFoodChecker from 'parser/shared/modules/items/FoodChecker';

const LOWER_FOOD_IDS = [
  SPELLS.ANGLERS_DELIGHT.id,
  SPELLS.HEARTY_ANGLERS_DELIGHT.id,
  SPELLS.TENDER_TWILIGHT_JERKY.id,
  SPELLS.HEARTY_TENDER_TWILIGHT_JERKY.id,
] satisfies number[];

const MID_TIER_FOOD_IDS = [
  SPELLS.WELL_FED_SNACKS.id,
  SPELLS.HEARTY_WELL_FED_SNACKS.id,
  SPELLS.WELL_FED_QUICK_AND_EASY.id,
  SPELLS.HEARTY_WELL_FED_QUICK_AND_EASY.id,
  SPELLS.SALT_BAKED_SEAFOOD.id,
  SPELLS.HEARTY_SALT_BAKED_SEAFOOD.id,
  SPELLS.MARINATED_TENDERLOINS.id,
  SPELLS.HEARTY_MARINATED_TENDERLOINS.id,
  SPELLS.FISH_AND_CHIPS.id,
  SPELLS.HEARTY_FISH_AND_CHIPS.id,
  SPELLS.CHIPPY_TEA.id,
  SPELLS.HEARTY_CHIPPY_TEA.id,
  SPELLS.SWEET_AND_SPICY_SOUP.id,
  SPELLS.HEARTY_SWEET_AND_SPICY_SOUP.id,
  SPELLS.DEEPFIN_PATTY.id,
  SPELLS.HEARTY_DEEPFIN_PATTY.id,
  SPELLS.SALTY_DOG.id,
  SPELLS.HEARTY_SALTY_DOG.id,
  SPELLS.GINGER_GLAZED_FILLET.id,
  SPELLS.HEARTY_GINGER_GLAZED_FILLET.id,
  SPELLS.FIERY_FISH_STICKS.id,
  SPELLS.HEARTY_FIERY_FISH_STICKS.id,
  SPELLS.ZESTY_NIBBLERS.id,
  SPELLS.HEARTY_ZESTY_NIBBLERS.id,
  SPELLS.STUFFED_CAVE_PEPPERS.id,
  SPELLS.HEARTY_STUFFED_CAVE_PEPPERS.id,
  SPELLS.MYCOBLOOM_RISOTTO.id,
  SPELLS.HEARTY_MYCOBLOOM_RISOTTO.id,
  SPELLS.SIZZLING_HONEY_ROAST.id,
  SPELLS.HEARTY_SIZZLING_HONEY_ROAST.id,
  SPELLS.MEAT_AND_POTATOES.id,
  SPELLS.HEARTY_MEAT_AND_POTATOES.id,
  SPELLS.RIB_STICKERS.id,
  SPELLS.HEARTY_RIB_STICKERS.id,
  SPELLS.SWEET_AND_SOUR_MEATBALLS.id,
  SPELLS.HEARTY_SWEET_AND_SOUR_MEATBALLS.id,
] satisfies number[];

const HIGHER_FOOD_IDS = [
  SPELLS.HEARTY_WELL_FED_469_CRIT.id,
  SPELLS.HEARTY_WELL_FED_469_HASTE.id,
  SPELLS.HEARTY_WELL_FED_469_MASTERY.id,
  SPELLS.HEARTY_WELL_FED_469_VERSATILITY.id,
  SPELLS.WELL_FED_469_CRIT.id,
  SPELLS.WELL_FED_469_HASTE.id,
  SPELLS.WELL_FED_469_MASTERY.id,
  SPELLS.WELL_FED_469_VERSATILITY.id,
  SPELLS.WELL_FED_PRIMARY_FEAST.id,
  SPELLS.HEARTY_WELL_FED_PRIMARY_FEAST.id,
] satisfies number[];

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
