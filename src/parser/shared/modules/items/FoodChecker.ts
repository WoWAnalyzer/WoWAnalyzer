import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Events, { ApplyBuffEvent } from 'parser/core/Events';

const LOWER_FOOD_IDS: number[] = [
  //BFA Food
  SPELLS.FAMINE_EVALUATOR_AND_SNACK_TABLE_FEAST_AGI.id,
  SPELLS.FAMINE_EVALUATOR_AND_SNACK_TABLE_FEAST_INT.id,
  SPELLS.FAMINE_EVALUATOR_AND_SNACK_TABLE_FEAST_STR.id,
  SPELLS.FAMINE_EVALUATOR_AND_SNACK_TABLE_FEAST_STA.id,
  SPELLS.FRAGRANT_KAKAVIA.id,
  SPELLS.ABYSSAL_FRIED_RISSOLE.id,
  SPELLS.BIL_TONG.id,
  SPELLS.MECH_DOWELS_BIG_MECH.id,
  SPELLS.BAKED_PORT_TATO.id,
];

const MID_TIER_FOOD_IDS: number[] = [
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

const HIGHER_FOOD_IDS: number[] = [
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

class FoodChecker extends Analyzer {
  lowerFoodUp = false;
  midTierFoodUp = false;
  higherFoodUp = false;

  constructor(options: Options){
    super(options);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this.onApplybuff.bind(this));
  }

  onApplybuff(event: ApplyBuffEvent) {
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
      style: ThresholdStyle.BOOLEAN,
    };
  }
  get isPresentFoodSuggestionThresholds() {
    return {
      actual: this.higherFoodUp || this.lowerFoodUp || this.midTierFoodUp,
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }
  suggestions(when: When) {
    let importance = SUGGESTION_IMPORTANCE.MINOR;
    let suggestionText = 'You did not have any food active when starting the fight. Having the right food buff during combat is an easy way to improve performance.';
    if (!this.higherFoodUp && (this.lowerFoodUp || this.midTierFoodUp)) {
      suggestionText = 'You did not have the best food active when starting the fight. Using the best food available is an easy way to improve performance.';
    }
    if (!this.higherFoodUp && !this.lowerFoodUp && !this.midTierFoodUp) {
      importance = SUGGESTION_IMPORTANCE.MAJOR;
    }
    when(this.higherFoodSuggestionThresholds)
      .addSuggestion((suggest) => suggest(suggestionText)
          .icon(SPELLS.FEAST_OF_GLUTTONOUS_HEDONISM_INT.icon)
          .staticImportance(importance));
  }
}
export default FoodChecker;
