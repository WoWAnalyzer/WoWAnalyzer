import SPELLS from 'common/SPELLS';
import BaseFoodChecker from 'parser/shared/modules/items/FoodChecker';

/**
 * 25 Primary Stat
 *
 * - Starter
 *   - Bloom Skewers
 *   - Mana-Infused Stew
 */
const STARTER_PRIMARY = [
  SPELLS.HEARTY_WELL_FED_25_PRIMARY.id,
  SPELLS.WELL_FED_25_PRIMARY.id,
] satisfies number[];

/**
 * 16 x 2 Secondary Stats
 *
 * - Starter
 *   - Farstrider Rations
 *   - Forager's Medley
 *   - Portable Snack
 *   - Quick Sandwich
 *   - Silvermoon Standard
 *   - Spiced Biscuit
 */
const STARTER_DUAL_SECONDARY = [
  SPELLS.FARSTRIDER_RATIONS.id,
  SPELLS.FORAGERS_MEDLEY.id,
  SPELLS.HEARTY_FARSTRIDER_RATIONS.id,
  SPELLS.HEARTY_FORAGERS_MEDLEY.id,
  SPELLS.HEARTY_PORTABLE_SNACK.id,
  SPELLS.HEARTY_QUICK_SANDWICH.id,
  SPELLS.HEARTY_SILVERMOON_STANDARD.id,
  SPELLS.HEARTY_SPICED_BISCUITS.id,
  SPELLS.PORTABLE_SNACK.id,
  SPELLS.QUICK_SANDWICH.id,
  SPELLS.SILVERMOON_STANDARD.id,
  SPELLS.SPICED_BISCUITS.id,
] satisfies number[];

/**
 * 35 Primary Stat
 *
 * - Intermediate
 *   - Spellfire Filet
 *   - Twilight Angler's Medley
 */
const INTERMEDIATE_35_PRIMARY = [
  SPELLS.HEARTY_WELL_FED_35_PRIMARY.id,
  SPELLS.WELL_FED_35_PRIMARY.id,
] satisfies number[];

/**
 * 22 x 2 Secondary Stats
 *
 * - Intermediate
 *   - Bloodthistle-Wrapped Cutlets
 *   - Eversong Pudding
 *   - Fried Bloomtail
 *   - Hearthflame Supper
 *   - Sunwell Delight
 *   - Wise Tails
 */
const INTERMEDIATE_DUAL_SECONDARY = [
  SPELLS.BLOODTHISTLE_WRAPPED_CUTLETS.id,
  SPELLS.EVERSONG_PUDDING.id,
  SPELLS.FRIED_BLOOMTAIL.id,
  SPELLS.HEARTHFLAME_SUPPER.id,
  SPELLS.HEARTY_BLOODTHISTLE_WRAPPED_CUTLETS.id,
  SPELLS.HEARTY_EVERSONG_PUDDING.id,
  SPELLS.HEARTY_FRIED_BLOOMTAIL.id,
  SPELLS.HEARTY_HEARTHFLAME_SUPPER.id,
  SPELLS.HEARTY_SUNWELL_DELIGHT.id,
  SPELLS.HEARTY_WISE_TAILS.id,
  SPELLS.SUNWELL_DELIGHT.id,
  SPELLS.WISE_TAILS.id,
] satisfies number[];

/**
 * 59 Secondary Stat
 *
 * - Advanced
 *   - Arcano Cutlets
 *   - Braised Blood Hunter
 *   - Buttered Root Crab
 *   - Crimson Calamari
 *   - Fel-Kissed Filet
 *   - Glitter Skewers
 *   - Null and Void Plate
 *   - Sun-Seared Lumifin
 *   - Tasty Smoked Tetra
 *   - Void-Kissed Fish Rolls
 *   - Warped Wise Wings
 */
const ADVANCED_59_SECONDARY = [
  SPELLS.HEARTY_WELL_FED_59_CRIT.id,
  SPELLS.HEARTY_WELL_FED_59_HASTE.id,
  SPELLS.HEARTY_WELL_FED_59_MASTERY.id,
  SPELLS.HEARTY_WELL_FED_59_VERSATILITY.id,
  SPELLS.WELL_FED_59_CRIT.id,
  SPELLS.WELL_FED_59_HASTE.id,
  SPELLS.WELL_FED_59_MASTERY.id,
  SPELLS.WELL_FED_59_VERSATILITY.id,
] satisfies number[];

/**
 * 65 Highest Secondary Stat
 *
 * - Master
 *   - Champion's Bento
 *   - Flora Frenzy
 */
const MASTER_65_SECONDARY = [
  SPELLS.HEARTY_WELL_FED_65_CRIT.id,
  SPELLS.HEARTY_WELL_FED_65_HASTE.id,
  SPELLS.HEARTY_WELL_FED_65_MASTERY.id,
  SPELLS.HEARTY_WELL_FED_65_VERSATILITY.id,
  SPELLS.WELL_FED_65_CRIT.id,
  SPELLS.WELL_FED_65_HASTE.id,
  SPELLS.WELL_FED_65_MASTERY.id,
  SPELLS.WELL_FED_65_VERSATILITY.id,
] satisfies number[];

/**
 * 50 Primary
 *
 * - Master
 *   - Impossibly Royal Roast
 *   - Royal Roast
 */
const MASTER_50_PRIMARY = [
  SPELLS.HEARTY_WELL_FED_50_PRIMARY.id,
  SPELLS.WELL_FED_50_PRIMARY.id,
] satisfies number[];

/**
 * 98 Stamina + 50 Primary
 *
 * - Feast
 *   - Harandar Celebration
 *   - Silvermoon Parade
 */
const PRIMARY_FEAST = [
  SPELLS.HEARTY_WELL_FED_PRIMARY_FEAST.id,
  SPELLS.WELL_FED_PRIMARY_FEAST.id,
] satisfies number[];

/**
 * 98 Stamina + 65 Highest Secondary
 *
 * - Feast
 *   - Blooming Feast
 *   - Quel'dorei Medley
 */
const STAMINA_65_SECONDARY = [
  SPELLS.HEARTY_WELL_FED_STAMINA_65_CRIT.id,
  SPELLS.HEARTY_WELL_FED_STAMINA_65_HASTE.id,
  SPELLS.HEARTY_WELL_FED_STAMINA_65_MASTERY.id,
  SPELLS.HEARTY_WELL_FED_STAMINA_65_VERSATILITY.id,
  SPELLS.WELL_FED_STAMINA_65_CRIT.id,
  SPELLS.WELL_FED_STAMINA_65_HASTE.id,
  SPELLS.WELL_FED_STAMINA_65_MASTERY.id,
  SPELLS.WELL_FED_STAMINA_65_VERSATILITY.id,
] satisfies number[];

// Earthen cannot eat regular food. They have separate food buffs that are always marked as good.
const EARTHEN_FOOD_IDS = [
  SPELLS.EARTHEN_WELL_FED_CRIT.id,
  SPELLS.EARTHEN_WELL_FED_VERS.id,
  SPELLS.EARTHEN_WELL_FED_HASTE.id,
  SPELLS.EARTHEN_WELL_FED_MASTERY.id,
] satisfies number[];

const LOWER_FOOD_IDS = [
  ...STARTER_PRIMARY,
  ...STARTER_DUAL_SECONDARY,
  SPELLS.FELBERRY_FIGS.id,
  SPELLS.HEARTY_FELBERRY_FIGS.id,
] satisfies number[];

const MID_TIER_FOOD_IDS = [
  ...INTERMEDIATE_35_PRIMARY,
  ...INTERMEDIATE_DUAL_SECONDARY,
  ...ADVANCED_59_SECONDARY,
] satisfies number[];

const HIGHER_FOOD_IDS = [
  ...MASTER_50_PRIMARY,
  ...MASTER_65_SECONDARY,
  ...PRIMARY_FEAST,
  ...STAMINA_65_SECONDARY,
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
