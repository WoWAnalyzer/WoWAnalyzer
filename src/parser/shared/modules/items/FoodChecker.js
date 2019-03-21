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

const HIGHER_FOOD_IDS = [
  // 100 primary stat
  SPELLS.BOUNTIFUL_CAPTAIN_FEAST_AGI.id,
  SPELLS.BOUNTIFUL_CAPTAIN_FEAST_INT.id,
  SPELLS.BOUNTIFUL_CAPTAIN_FEAST_STR.id,
  // 150 stamina
  SPELLS.BOUNTIFUL_CAPTAIN_FEAST_STA.id,
  SPELLS.WELL_FED_SEASONED_STEAK_AND_POTATOES.id,
  // 85 primary stat buffs - High quality in case feasts are unavailable
  SPELLS.BORALUS_BLOOD_SAUSAGE_AGI.id,
  SPELLS.BORALUS_BLOOD_SAUSAGE_INT.id,
  SPELLS.BORALUS_BLOOD_SAUSAGE_STR.id,
];

class FoodChecker extends Analyzer {
  lowerFoodUp = false;
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
      actual: this.higherFoodUp || this.lowerFoodUp,
      isEqual: false,
      style: 'boolean',
    };
  }
  suggestions(when) {
    let importance = SUGGESTION_IMPORTANCE.MINOR;
    let suggestionText = 'You did not have any food active when starting the fight. Having the right food buff during combat is an easy way to improve performance.';
    if (!this.higherFoodUp && this.lowerFoodUp) {
      suggestionText = 'You did not have the best food active when starting the fight. Using the best food available is an easy way to improve performance.';
    }
    if (!this.higherFoodUp && !this.lowerFoodUp) {
      importance = SUGGESTION_IMPORTANCE.MAJOR;
    }
    when(this.higherFoodSuggestionThresholds)
      .addSuggestion((suggest) => {
        return suggest(suggestionText)
          .icon(SPELLS.BOUNTIFUL_CAPTAIN_FEAST_AGI.icon)
          .staticImportance(importance);
      });
  }
}
export default FoodChecker;
