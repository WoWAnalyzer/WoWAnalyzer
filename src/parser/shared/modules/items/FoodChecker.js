import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';

const LOWER_FOOD_IDS = [
  // very low
  SPELLS.KUL_TIRAMISU.id,
  SPELLS.LOA_LEAF.id,
  SPELLS.RAVENBERRY_TARTS.id,
  SPELLS.MON_DAZI.id,
  // somwhat low
  SPELLS.HONEY_GLAZED_HAUNCHES.id,
  SPELLS.SAILOR_PIE.id,
  SPELLS.SWAMP_FISH_N_CHIPS.id,
  SPELLS.SPICED_SNAPPER.id,
  // low - 75 primary stat
  SPELLS.GALLEY_BANQUET_AGI.id,
  SPELLS.GALLEY_BANQUET_INT.id,
  SPELLS.GALLEY_BANQUET_STR.id,
  // 113 stamina
  SPELLS.GALLEY_BANQUET_STA.id,
  SPELLS.WELL_FED_WILD_BERRY_BREAD.id,
  // caused by Reawakening trait (Resto Druid rebirth) - 60 primary stat
  SPELLS.WELL_FED_REAWAKENING_INT.id,
  SPELLS.WELL_FED_REAWAKENING_STR.id,
  SPELLS.WELL_FED_REAWAKENING_AGI.id,
];

const MID_TIER_FOOD_IDS = [
  // 100 primary stat
  SPELLS.BOUNTIFUL_CAPTAIN_FEAST_AGI.id,
  SPELLS.BOUNTIFUL_CAPTAIN_FEAST_INT.id,
  SPELLS.BOUNTIFUL_CAPTAIN_FEAST_STR.id,
  // 150 stamina
  SPELLS.BOUNTIFUL_CAPTAIN_FEAST_STA.id,
  SPELLS.WELL_FED_SEASONED_STEAK_AND_POTATOES.id,
  // 85 primary stat buffs
  SPELLS.BORALUS_BLOOD_SAUSAGE_AGI.id,
  SPELLS.BORALUS_BLOOD_SAUSAGE_INT.id,
  SPELLS.BORALUS_BLOOD_SAUSAGE_STR.id,
];

const HIGHER_FOOD_IDS = [
  // 131 primary stat
  SPELLS.FAMINE_EVALUATOR_AND_SNACK_TABLE_FEAST_AGI.id,
  SPELLS.FAMINE_EVALUATOR_AND_SNACK_TABLE_FEAST_INT.id,
  SPELLS.FAMINE_EVALUATOR_AND_SNACK_TABLE_FEAST_STR.id,
  // 198 stamina
  SPELLS.FAMINE_EVALUATOR_AND_SNACK_TABLE_FEAST_STA.id,
  SPELLS.FRAGRANT_KAKAVIA.id,
  // 93 secondary stat
  SPELLS.ABYSSAL_FRIED_RISSOLE.id,
  SPELLS.BIL_TONG.id,
  SPELLS.MECH_DOWELS_BIG_MECH.id,
  SPELLS.BAKED_PORT_TATO.id,
];

<<<<<<< Updated upstream:src/parser/shared/modules/items/FoodChecker.js
=======
const MID_TIER_FOOD_IDS = [
  //18 Primary Stat
  SPELLS.SURPRISINGLY_PALATABLE_FEAST_INT.id,
  SPELLS.SURPRISINGLY_PALATABLE_FEAST_AGI.id,
  SPELLS.SURPRISINGLY_PALATABLE_FEAST_STR.id,

  //14 Stam
  SPELLS.PICKLED_MEAT_SMOOTHIE.id,

  //18 Secondary Stat
  SPELLS.BUTTERSCOTCH_MARINATED_RIBS.id,
  SPELLS.CINNAMON_BONEFISH_STEW.id,
  SPELLS.MEATY_APPLE_DUMPLINGS.id,
  SPELLS.SWEET_SILVERGILL_SAUSAGES.id,
];

const HIGHER_FOOD_IDS = [
  //20 Primary Stat
  SPELLS.FEAST_OF_GLUTTONOUS_HEDONISM_INT.id,
  SPELLS.FEAST_OF_GLUTTONOUS_HEDONISM_AGI.id,
  SPELLS.FEAST_OF_GLUTTONOUS_HEDONISM_STR.id,

  //22 Stam
  SPELLS.BANANA_BEEF_PUDDING.id,

  //30 Secondary Stat
  SPELLS.SPINEFIN_SOUFFLE_AND_FRIES.id,
  SPELLS.TENEBROUS_CROWN_ROAST_ASPIC.id,
  SPELLS.IRIDESCENT_RAVIOLI_WITH_APPLE_SAUCE.id,
  SPELLS.STEAK_A_LA_MODE.id,
];

>>>>>>> Stashed changes:src/parser/shared/modules/items/FoodChecker.ts
class FoodChecker extends Analyzer {
  lowerFoodUp = false;
  midTierFoodUp = false;
  higherFoodUp = false;
  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (event.prepull) {
      if (LOWER_FOOD_IDS.includes(spellId)) {
        this.lowerFoodUp = true;
      }
      if (HIGHER_FOOD_IDS.includes(spellId)) {
        this.higherFoodUp = true;
      }
      if (MID_TIER_FOOD_IDS.includes(spellId)) {
        this.midTierFoodUp = true;
      }
    }
  }
  get higherFoodSuggestionThresholds() {
    return {
      actual: this.higherFoodUp,
      isEqual: false,
      style: 'boolean',
    };
  }
  get isPresentFoodSuggestionThresholds() {
    return {
      actual: this.higherFoodUp || this.lowerFoodUp || this.midTierFoodUp,
      isEqual: false,
      style: 'boolean',
    };
  }
  suggestions(when) {
    let importance = SUGGESTION_IMPORTANCE.MINOR;
    let suggestionText = 'You did not have any food active when starting the fight. Having the right food buff during combat is an easy way to improve performance.';
    if (!this.higherFoodUp && (this.lowerFoodUp || this.midTierFoodUp)) {
      suggestionText = 'You did not have the best food active when starting the fight. Using the best food available is an easy way to improve performance.';
    }
    if (!this.higherFoodUp && !this.lowerFoodUp && !this.midTierFoodUp) {
      importance = SUGGESTION_IMPORTANCE.MAJOR;
    }
    when(this.higherFoodSuggestionThresholds)
      .addSuggestion((suggest) => {
        return suggest(suggestionText)
          .icon(SPELLS.FAMINE_EVALUATOR_AND_SNACK_TABLE_FEAST_STR.icon)
          .staticImportance(importance);
      });
  }
}
export default FoodChecker;
