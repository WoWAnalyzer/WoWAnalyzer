import SHADOWLANDS_SPELLS from 'common/SPELLS/shadowlands/others';
import SPELLS from 'common/SPELLS/dragonflight/food';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When, ThresholdStyle } from 'parser/core/ParseResults';

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

class FoodChecker extends Analyzer {
  lowerFoodUp = false;
  midTierFoodUp = false;
  higherFoodUp = false;
  foodBuffId?: number;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this.onApplybuff.bind(this));
  }

  onApplybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (event.prepull) {
      if (LOWER_FOOD_IDS.includes(spellId)) {
        this.lowerFoodUp = true;
        this.foodBuffId = spellId;
      }
      if (HIGHER_FOOD_IDS.includes(spellId)) {
        this.higherFoodUp = true;
        this.foodBuffId = spellId;
      }
      if (MID_TIER_FOOD_IDS.includes(spellId)) {
        this.midTierFoodUp = true;
        this.foodBuffId = spellId;
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
    let suggestionText =
      'You did not have any food active when starting the fight. Having the right food buff during combat is an easy way to improve performance.';
    if (!this.higherFoodUp && (this.lowerFoodUp || this.midTierFoodUp)) {
      suggestionText =
        'You did not have the best food active when starting the fight. Using the best food available is an easy way to improve performance.';
    }
    if (!this.higherFoodUp && !this.lowerFoodUp && !this.midTierFoodUp) {
      importance = SUGGESTION_IMPORTANCE.MAJOR;
    }
    when(this.higherFoodSuggestionThresholds).addSuggestion((suggest) =>
      suggest(suggestionText).icon(SPELLS.FATED_FORTUNE_COOKIE.icon).staticImportance(importance),
    );
  }
}
export default FoodChecker;
