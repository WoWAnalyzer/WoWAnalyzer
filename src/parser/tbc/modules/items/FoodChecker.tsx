import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When, ThresholdStyle } from 'parser/core/ParseResults';

const MID_TIER_FOOD_IDS = [
  // +20 Stamina, +20 Spirit
  35272, // https://tbc.wowhead.com/spell=35272/well-fed
  33254, // https://tbc.wowhead.com/spell=33254/well-fed
  33257, // https://tbc.wowhead.com/spell=33257/well-fed
  45245, // https://tbc.wowhead.com/spell=45245/well-fed
];

const HIGHER_FOOD_IDS = [
  // +44 Healing, +20 Spirit
  33268, // https://tbc.wowhead.com/spell=33268/well-fed

  // +30 Stamina, +20 Spirit
  33257, // https://tbc.wowhead.com/spell=33257/well-fed

  // +23 Spell Damage, +20 Spirit
  33263, // https://tbc.wowhead.com/spell=33263/well-fed

  // +40 Attack Power, +20 Spirit
  33259, // https://tbc.wowhead.com/spell=33259/well-fed

  // +20 Agility, +20 Spirit
  33261, // https://tbc.wowhead.com/spell=33261/well-fed

  // +20 Strength, +20 Spirit
  40323, // https://tbc.wowhead.com/spell=40323/well-fed
  33256, // https://tbc.wowhead.com/spell=33256/well-fed

  // +20 Hit Rating, +20 Spirit
  43764, // https://tbc.wowhead.com/spell=43764/well-fed

  // +20 Spell Critical Strike Rating, +20 Spirit
  43722, // https://tbc.wowhead.com/spell=43722/enlightened

  // +8 Mana per 5 seconds, +20 Stamina
  33265, // https://tbc.wowhead.com/spell=33265/well-fed

  // +8 to All Resistances
  45619, // https://tbc.wowhead.com/spell=45619/well-fed

  // Deals Nature Damage to nearby enemies
  43730, // https://tbc.wowhead.com/spell=43730/electrified
];

class FoodChecker extends Analyzer {
  midTierFoodUp = false;
  higherFoodUp = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this.onApplybuff.bind(this));
  }

  onApplybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (event.prepull) {
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
      actual: this.higherFoodUp || this.midTierFoodUp,
      isEqual: false,
      style: ThresholdStyle.BOOLEAN,
    };
  }

  suggestions(when: When) {
    let importance = SUGGESTION_IMPORTANCE.MINOR;
    let suggestionText =
      'You did not have any food active when starting the fight. Having the right food buff during combat is an easy way to improve performance.';
    if (!this.higherFoodUp && this.midTierFoodUp) {
      suggestionText =
        'You did not have the best food active when starting the fight. Using the best food available is an easy way to improve performance.';
    }
    if (!this.higherFoodUp && !this.midTierFoodUp) {
      importance = SUGGESTION_IMPORTANCE.MAJOR;
    }
    when(this.higherFoodSuggestionThresholds).addSuggestion((suggest) =>
      suggest(suggestionText)
        .icon(SPELLS.FEAST_OF_GLUTTONOUS_HEDONISM_INT.icon)
        .staticImportance(importance),
    );
  }
}

export default FoodChecker;
