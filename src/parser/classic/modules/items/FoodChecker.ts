import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When, ThresholdStyle } from 'parser/core/ParseResults';

// Item Id's
const FISH_FEAST = 57426;
const DRAGONFIN_FILET = 57370;
const FIRECRACKER_SALMON = 57341;
const TENDER_SHOVELTUSK_STEAK = 57326;
const BLACKENED_DRAGONFIN = 57366;
const SPICED_MAMMOTH_TREATS = 43771;
const SNAPPER_EXTREME = 57359;
const RHINO_DOGS = 57289;
const GREAT_FEAST = 57301;
const RHINOLICIOUS_WORMSTEAK = 57355;
const MEGA_MAMMOTH_MEAL = 57324;
const IMPERIAL_MANTA_STEAK = 57344;
const WORG_TARTARE = 57359;
const HEARTY_RHINO = 57357;
const VERY_BURNT_WORG = 57331;
const DALARAN_CLAM_CHOWDER = 58067;
const POACHED_NORTHERN_SCULPIN = 57335;
const CUTTLESTEAK = 57364;
const SHOVELTUSK_STEAK = 57138;
const GRILLED_SCULPIN = 57085;
const SPICED_WORM_BURGER = 57328;
const BAKED_MANTA_RAY = 57101;
const SPICY_FRIED_HERRING = 57354;
const MAMMOTH_MEAL = 57110;
const SPICY_BLUE_NETTLEFISH = 57343;
const SMOKED_SALMON = 57096;
const POACHED_NETTLEFISH = 57098;
const WORM_DELIGHT = 57285;
const PICKLED_FANGTOOTH = 57106;
const MIGHTY_RHINO_DOGS = 57333;
const ROASTED_WORG = 57287;

interface FoodInfo {
  itemId: number;
  recommendedFood?: number[];
}

const FOOD_MAPPINGS: { [spellId: number]: FoodInfo } = {
  [57426]: { itemId: FISH_FEAST },
  [57399]: { itemId: FISH_FEAST },
  [57397]: { itemId: FISH_FEAST },
  [57370]: { itemId: DRAGONFIN_FILET },
  [57341]: { itemId: FIRECRACKER_SALMON },
  [57326]: { itemId: TENDER_SHOVELTUSK_STEAK },
  [57366]: { itemId: BLACKENED_DRAGONFIN },
  [57359]: { itemId: SPICED_MAMMOTH_TREATS },
  // [57359]: { itemId: IMPERIAL_MANTA_STEAK },
  [57289]: { itemId: SNAPPER_EXTREME, recommendedFood: [MIGHTY_RHINO_DOGS] },
  [57301]: { itemId: RHINO_DOGS, recommendedFood: [FISH_FEAST] },
  [57355]: { itemId: GREAT_FEAST },
  [57324]: { itemId: RHINOLICIOUS_WORMSTEAK },
  [57344]: { itemId: MEGA_MAMMOTH_MEAL },
  [57357]: { itemId: WORG_TARTARE },
  [57331]: { itemId: HEARTY_RHINO },
  [58067]: { itemId: VERY_BURNT_WORG, recommendedFood: [FISH_FEAST] },
  [57335]: { itemId: DALARAN_CLAM_CHOWDER },
  [57364]: { itemId: POACHED_NORTHERN_SCULPIN },
  [57138]: { itemId: CUTTLESTEAK, recommendedFood: [FISH_FEAST, FIRECRACKER_SALMON, TENDER_SHOVELTUSK_STEAK] },
  [57085]: { itemId: SHOVELTUSK_STEAK, recommendedFood: [POACHED_NORTHERN_SCULPIN, MEGA_MAMMOTH_MEAL] },
  [57328]: { itemId: GRILLED_SCULPIN },
  [57101]: { itemId: SPICED_WORM_BURGER, recommendedFood: [VERY_BURNT_WORG, IMPERIAL_MANTA_STEAK] },
  [57354]: { itemId: BAKED_MANTA_RAY },
  [57110]: { itemId: SPICY_FRIED_HERRING, recommendedFood: [POACHED_NORTHERN_SCULPIN, MEGA_MAMMOTH_MEAL] },
  [57343]: { itemId: MAMMOTH_MEAL },
  [57096]: { itemId: SPICY_BLUE_NETTLEFISH, recommendedFood: [FISH_FEAST, FIRECRACKER_SALMON, TENDER_SHOVELTUSK_STEAK] },
  [57098]: { itemId: SMOKED_SALMON, recommendedFood: [SPICY_BLUE_NETTLEFISH] },
  [57285]: { itemId: POACHED_NETTLEFISH, recommendedFood: [SPICY_BLUE_NETTLEFISH] },
  [57106]: { itemId: WORM_DELIGHT, recommendedFood: [SPICY_FRIED_HERRING, MIGHTY_RHINO_DOGS] },
  [57333]: { itemId: PICKLED_FANGTOOTH },
  [57287]: { itemId: MIGHTY_RHINO_DOGS, recommendedFood: [VERY_BURNT_WORG, IMPERIAL_MANTA_STEAK] },
};

class FoodChecker extends Analyzer {
  midTierFoodUp = false;
  higherFoodUp = false;
  activeFoodId?: number;
  recommendedHigherTierFoods?: number[];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this.onApplybuff.bind(this));
  }

  onApplybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (event.prepull) {
      if (FOOD_MAPPINGS[spellId]) {
        this.activeFoodId = FOOD_MAPPINGS[spellId].itemId;
        // There is valid food, but is it the best food?
        if (!FOOD_MAPPINGS[spellId].recommendedFood) {
          this.higherFoodUp = true;
        } else {
          this.midTierFoodUp = true;
          this.recommendedHigherTierFoods = FOOD_MAPPINGS[spellId].recommendedFood;
        }
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
