import SPELLS from 'common/SPELLS/thewarwithin/food';
import BaseFoodChecker from 'parser/shared/modules/items/FoodChecker';

/**
 * 328 Lowest Secondary Stat for 30/15 Minutes
 *
 * - Snacks
 *   - Simple Stew
 *   - Skewered Fillet
 *   - Unseasoned Field Steak
 *   - Spongey Scramble
 *   - Roasted Mycobloom
 * - Quick and Easy
 *   - Coreway Kabob
 *   - Flash Fire Fillet
 *   - Hallowfall Chili
 *   - Pan Seared Mycobloom
 */
const SNACKS_QUICK_AND_EASY = [
  SPELLS.HEARTY_WELL_FED_328_CRIT_15.id,
  SPELLS.HEARTY_WELL_FED_328_HASTE_15.id,
  SPELLS.HEARTY_WELL_FED_328_MASTERY_15.id,
  SPELLS.HEARTY_WELL_FED_328_VERSATILITY_15.id,
  SPELLS.WELL_FED_328_CRIT_15.id,
  SPELLS.WELL_FED_328_HASTE_15.id,
  SPELLS.WELL_FED_328_MASTERY_15.id,
  SPELLS.WELL_FED_328_VERSATILITY_15.id,

  SPELLS.HEARTY_WELL_FED_328_CRIT_30.id,
  SPELLS.HEARTY_WELL_FED_328_HASTE_30.id,
  SPELLS.HEARTY_WELL_FED_328_MASTERY_30.id,
  SPELLS.HEARTY_WELL_FED_328_VERSATILITY_30.id,
  SPELLS.WELL_FED_328_CRIT_30.id,
  SPELLS.WELL_FED_328_HASTE_30.id,
  SPELLS.WELL_FED_328_MASTERY_30.id,
  SPELLS.WELL_FED_328_VERSATILITY_30.id,
] satisfies number[];

/**
 * 235 of two secondary stats for 60 minutes
 */
const FULL_BELLY_DUAL_SECONDARY = [
  SPELLS.CHIPPY_TEA.id,
  SPELLS.DEEPFIN_PATTY.id,
  SPELLS.FISH_AND_CHIPS.id,
  SPELLS.HEARTY_CHIPPY_TEA.id,
  SPELLS.HEARTY_DEEPFIN_PATTY.id,
  SPELLS.HEARTY_FISH_AND_CHIPS.id,
  SPELLS.HEARTY_MARINATED_TENDERLOINS.id,
  SPELLS.HEARTY_SALT_BAKED_SEAFOOD.id,
  SPELLS.HEARTY_SWEET_AND_SPICY_SOUP.id,
  SPELLS.MARINATED_TENDERLOINS.id,
  SPELLS.SALT_BAKED_SEAFOOD.id,
  SPELLS.SWEET_AND_SPICY_SOUP.id,
] satisfies number[];

/**
 * 328 Secondary stats for 60 minutes
 */
const FULL_BELLY_328_SECONDARY = [
  SPELLS.SALTY_DOG.id,
  SPELLS.HEARTY_SALTY_DOG.id,
  SPELLS.GINGER_GLAZED_FILLET.id,
  SPELLS.HEARTY_GINGER_GLAZED_FILLET.id,
  SPELLS.FIERY_FISH_STICKS.id,
  SPELLS.HEARTY_FIERY_FISH_STICKS.id,
  SPELLS.ZESTY_NIBBLERS.id,
  SPELLS.HEARTY_ZESTY_NIBBLERS.id,
] satisfies number[];

/**
 * 312 Stamina + 156 Primary
 */
const STAMINA_156_PRIMARY = [
  SPELLS.MEAT_AND_POTATOES.id,
  SPELLS.HEARTY_MEAT_AND_POTATOES.id,
  SPELLS.RIB_STICKERS.id,
  SPELLS.HEARTY_RIB_STICKERS.id,
  SPELLS.SWEET_AND_SOUR_MEATBALLS.id,
  SPELLS.HEARTY_SWEET_AND_SOUR_MEATBALLS.id,
] satisfies number[];

/**
 * 446 Stamina + 223 Primary
 */
const STAMINA_223_PRIMARY = [
  SPELLS.STUFFED_CAVE_PEPPERS.id,
  SPELLS.HEARTY_STUFFED_CAVE_PEPPERS.id,
  SPELLS.MYCOBLOOM_RISOTTO.id,
  SPELLS.HEARTY_MYCOBLOOM_RISOTTO.id,
  SPELLS.SIZZLING_HONEY_ROAST.id,
  SPELLS.HEARTY_SIZZLING_HONEY_ROAST.id,
  SPELLS.MEAT_AND_POTATOES.id,
] satisfies number[];

const STAMINA = [
  SPELLS.ANGLERS_DELIGHT.id,
  SPELLS.HEARTY_ANGLERS_DELIGHT.id,
  SPELLS.TENDER_TWILIGHT_JERKY.id,
  SPELLS.HEARTY_TENDER_TWILIGHT_JERKY.id,
];

/**
 * 469 Secondary Stat. There's both food that gives your lowest secondary stat
 * and food that gives your highest. They however give the same effects, so we
 * count both as good.
 *
 * - The Sushi Special
 * - Beledar's Bounty
 * - Jester's Board
 * - Empress' Farewell
 * - Outsider's Provisions
 * - Everything Stew
 */
const GOOD_SECONDARY_FOOD_IDS = [
  SPELLS.HEARTY_WELL_FED_469_CRIT.id,
  SPELLS.HEARTY_WELL_FED_469_HASTE.id,
  SPELLS.HEARTY_WELL_FED_469_MASTERY.id,
  SPELLS.HEARTY_WELL_FED_469_VERSATILITY.id,
  SPELLS.WELL_FED_469_CRIT.id,
  SPELLS.WELL_FED_469_HASTE.id,
  SPELLS.WELL_FED_469_MASTERY.id,
  SPELLS.WELL_FED_469_VERSATILITY.id,
] satisfies number[];

// Earthen cannot eat regular food. They have separate food buffs that are always marked as good.
const EARTHEN_FOOD_IDS = [
  SPELLS.EARTHEN_WELL_FED_CRIT.id,
  SPELLS.EARTHEN_WELL_FED_VERS.id,
  SPELLS.EARTHEN_WELL_FED_HASTE.id,
  SPELLS.EARTHEN_WELL_FED_MASTERY.id,
];

const LOWER_FOOD_IDS = [...STAMINA, ...STAMINA_156_PRIMARY] satisfies number[];

const MID_TIER_FOOD_IDS = [
  ...SNACKS_QUICK_AND_EASY,
  ...FULL_BELLY_328_SECONDARY,
  ...STAMINA_223_PRIMARY,
] satisfies number[];

const HIGHER_FOOD_IDS = [
  ...GOOD_SECONDARY_FOOD_IDS,
  // Once secondary stats value even out (as we get more gear),
  // getting 235 of two secondary stats could be just as good or better than 469 of one.
  ...FULL_BELLY_DUAL_SECONDARY,
  SPELLS.WELL_FED_PRIMARY_FEAST.id,
  SPELLS.HEARTY_WELL_FED_PRIMARY_FEAST.id,
  ...EARTHEN_FOOD_IDS,
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
