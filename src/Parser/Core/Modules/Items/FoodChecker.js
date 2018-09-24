import Analyzer from 'Parser/Core/Analyzer';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import SPELLS from 'common/SPELLS';

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
  // low
  SPELLS.GALLEY_BANQUET_AGI.id,
  SPELLS.GALLEY_BANQUET_INT.id,
  SPELLS.GALLEY_BANQUET_STR.id,
  SPELLS.GALLEY_BANQUET_STA.id,
];

const HIGHER_FOOD_IDS = [
  SPELLS.BOUNTIFUL_CAPTAIN_FEAST_AGI.id,
  SPELLS.BOUNTIFUL_CAPTAIN_FEAST_INT.id,
  SPELLS.BOUNTIFUL_CAPTAIN_FEAST_STR.id,
  SPELLS.BOUNTIFUL_CAPTAIN_FEAST_STA.id,
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

  get foodSuggestionThresholds() {
    return {
      actual: this.higherFoodUp,
      isEqual: false,
      style: 'boolean',
    };
  }

  suggestions(when) {
    let suggestionText = 'You did not have any food buff combat started. Having the right food buff during combat is an easy way to improve performance.';

    if (!this.higherFoodUp && this.lowerFoodUp) {
      suggestionText = 'You did not have the best food active when starting the fight. Using the best food available is an easy way to improve performance.';
    }

    when(this.foodSuggestionThresholds)
      .addSuggestion((suggest) => {
        return suggest(suggestionText)
          .icon(SPELLS.BOUNTIFUL_CAPTAIN_FEAST_AGI.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.MINOR);
      });
  }
}

export default FoodChecker;
