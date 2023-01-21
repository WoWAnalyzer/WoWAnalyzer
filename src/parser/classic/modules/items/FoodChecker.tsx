import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { ItemLink } from 'interface';

const FISH_FEAST = 43015; // https://www.wowhead.com/wotlk/item=43015/fish-feast
const DRAGONFIN_FILET = 43000; // https://www.wowhead.com/wotlk/item=43000/dragonfin-filet
const FIRECRACKER_SALMON = 34767; // https://www.wowhead.com/wotlk/item=34767/firecracker-salmon
const TENDER_SHOVELTUSK_STEAK = 34755; // https://www.wowhead.com/wotlk/item=34755/tender-shoveltusk-steak
const BLACKENED_DRAGONFIN = 42999; // https://www.wowhead.com/wotlk/item=42999/blackened-dragonfin
const SPICED_MAMMOTH_TREATS = 43005; // https://www.wowhead.com/wotlk/item=43005/spiced-mammoth-treats
const SNAPPER_EXTREME = 42996; // https://www.wowhead.com/wotlk/item=42996/snapper-extreme
const RHINO_DOGS = 34752; // https://www.wowhead.com/wotlk/item=34752/rhino-dogs
const GREAT_FEAST = 34753; // https://www.wowhead.com/wotlk/item=34753/great-feast
const RHINOLICIOUS_WORMSTEAK = 42994; // https://www.wowhead.com/wotlk/item=42994/rhinolicious-wormsteak
const MEGA_MAMMOTH_MEAL = 34754; // https://www.wowhead.com/wotlk/item=34754/mega-mammoth-meal
const IMPERIAL_MANTA_STEAK = 34769; // https://www.wowhead.com/wotlk/item=34769/imperial-manta-steak
const HEARTY_RHINO = 42995; // https://www.wowhead.com/wotlk/item=42995/hearty-rhino
const VERY_BURNT_WORG = 34757; // https://www.wowhead.com/wotlk/item=34757/very-burnt-worg
const DALARAN_CLAM_CHOWDER = 43268; // https://www.wowhead.com/wotlk/item=43268/dalaran-clam-chowder
const POACHED_NORTHERN_SCULPIN = 34766; // https://www.wowhead.com/wotlk/item=34766/poached-northern-sculpin
const CUTTLESTEAK = 42998; // https://www.wowhead.com/wotlk/item=42998/cuttlesteak
const SHOVELTUSK_STEAK = 34749; // https://www.wowhead.com/wotlk/item=34749/shoveltusk-steak
const GRILLED_SCULPIN = 34762; // https://www.wowhead.com/wotlk/item=34762/grilled-sculpin
const SPICED_WORM_BURGER = 34756; // https://www.wowhead.com/wotlk/item=34756/spiced-worm-burger
const BAKED_MANTA_RAY = 42942; // https://www.wowhead.com/wotlk/item=42942/baked-manta-ray
const SPICY_FRIED_HERRING = 42993; // https://www.wowhead.com/wotlk/item=42993/spicy-fried-herring
const MAMMOTH_MEAL = 34748; // https://www.wowhead.com/wotlk/item=34748/mammoth-meal
const SPICY_BLUE_NETTLEFISH = 34768; // https://www.wowhead.com/wotlk/item=34768/spicy-blue-nettlefish
const SMOKED_SALMON = 34763; // https://www.wowhead.com/wotlk/item=34763/smoked-salmon
const POACHED_NETTLEFISH = 34764; // https://www.wowhead.com/wotlk/item=34764/poached-nettlefish
const WORM_DELIGHT = 34750; // https://www.wowhead.com/wotlk/item=34750/worm-delight
const PICKLED_FANGTOOTH = 34765; // https://www.wowhead.com/wotlk/item=34765/pickled-fangtooth
const MIGHTY_RHINO_DOGS = 34758; // https://www.wowhead.com/wotlk/item=34758/mighty-rhino-dogs
const ROASTED_WORG = 34751; // https://www.wowhead.com/wotlk/item=34751/roasted-worg
// Shares spell ID with https://www.wowhead.com/wotlk/item=42996/snapper-extreme
// const WORG_TARTARE = 44953;          // https://www.wowhead.com/wotlk/item=44953/worg-tartare

interface FoodInfo {
  itemId: number;
  recommendedFood?: number[];
}

const FOOD_MAPPINGS: { [spellId: number]: FoodInfo } = {
  // 80 Attack Power, 46 Spell Power and 40 Stamina
  57426: { itemId: FISH_FEAST },
  57399: { itemId: FISH_FEAST },
  57397: { itemId: FISH_FEAST },

  // 60 Attack Power, 35 Spell Power and 30 Stamina
  57301: { itemId: GREAT_FEAST, recommendedFood: [FISH_FEAST] },
  58067: { itemId: DALARAN_CLAM_CHOWDER, recommendedFood: [FISH_FEAST] },

  // 40 Strength and 40 Stamina
  57370: { itemId: DRAGONFIN_FILET },

  // 40 Agility and 40 Stamina.
  57366: { itemId: BLACKENED_DRAGONFIN },

  // 46 Spell Power and 40 Stamina
  57341: { itemId: FIRECRACKER_SALMON },
  57326: { itemId: TENDER_SHOVELTUSK_STEAK },
  // 35 Spell Power and 30 Stamina
  57138: {
    itemId: SHOVELTUSK_STEAK,
    recommendedFood: [FISH_FEAST, FIRECRACKER_SALMON, TENDER_SHOVELTUSK_STEAK],
  },
  // 35 Spell Power and 40 Stamina
  57096: {
    itemId: SMOKED_SALMON,
    recommendedFood: [FISH_FEAST, FIRECRACKER_SALMON, TENDER_SHOVELTUSK_STEAK],
  },

  // 40 Hit Rating and 40 Stamina
  57359: { itemId: SNAPPER_EXTREME, recommendedFood: [] },
  // 57359: { itemId: WORG_TARTARE },

  // 40 Expertise Rating and 40 Stamina
  57355: { itemId: RHINOLICIOUS_WORMSTEAK },

  // 40 armor penetration rating and 40 Stamina
  57357: { itemId: HEARTY_RHINO },

  //  20 Mana per 5 seconds and 40 Stamina
  57354: { itemId: SPICY_FRIED_HERRING },
  57333: { itemId: MIGHTY_RHINO_DOGS },
  // 15 Mana per 5 seconds and 40 Stamina
  57106: { itemId: PICKLED_FANGTOOTH, recommendedFood: [SPICY_FRIED_HERRING, MIGHTY_RHINO_DOGS] },
  // 15 Mana per 5 seconds and 30 Stamina
  57289: { itemId: RHINO_DOGS, recommendedFood: [SPICY_FRIED_HERRING, MIGHTY_RHINO_DOGS] },

  // 40 Haste Rating and 40 Stamina
  57331: { itemId: VERY_BURNT_WORG },
  57344: { itemId: IMPERIAL_MANTA_STEAK },
  // 30 Haste Rating and 40 Stamina
  57101: { itemId: BAKED_MANTA_RAY, recommendedFood: [VERY_BURNT_WORG, IMPERIAL_MANTA_STEAK] },
  // 30 Haste Rating and 30 Stamina
  57287: { itemId: ROASTED_WORG, recommendedFood: [VERY_BURNT_WORG, IMPERIAL_MANTA_STEAK] },

  // 80 Attack Power and 40 Stamina
  57324: { itemId: MEGA_MAMMOTH_MEAL },
  57335: { itemId: POACHED_NORTHERN_SCULPIN },
  // 60 Attack Power and 40 Stamina
  57085: {
    itemId: GRILLED_SCULPIN,
    recommendedFood: [FISH_FEAST, MEGA_MAMMOTH_MEAL, POACHED_NORTHERN_SCULPIN],
  },
  57110: {
    itemId: MAMMOTH_MEAL,
    recommendedFood: [FISH_FEAST, MEGA_MAMMOTH_MEAL, POACHED_NORTHERN_SCULPIN],
  },

  // 40 Critical Strike Rating and 40 Stamina
  57328: { itemId: SPICED_WORM_BURGER },
  57343: { itemId: SPICY_BLUE_NETTLEFISH },
  // 30 Critical Strike Rating and 40 Stamina
  57098: {
    itemId: POACHED_NETTLEFISH,
    recommendedFood: [SPICED_WORM_BURGER, SPICY_BLUE_NETTLEFISH],
  },
  // 30 Critical Strike Rating and 30 Stamina
  57285: { itemId: WORM_DELIGHT, recommendedFood: [SPICED_WORM_BURGER, SPICY_BLUE_NETTLEFISH] },

  // 40 Spirit and 40 Stamina
  57364: { itemId: CUTTLESTEAK },

  // Strength and Stamina of your pet by 30
  43771: { itemId: SPICED_MAMMOTH_TREATS },
};

// Setting this to true will replace the food suggestion with a list of the
// defined foods and their recommendedFoods. This is useful for sanity checking
// the list of foods you are marking as upgrades.
const DEBUG = false;

const RecommendedFoodList = ({ spellId }: { spellId: number }) => {
  const foodInfo = FOOD_MAPPINGS[spellId];
  if (!foodInfo?.recommendedFood || foodInfo.recommendedFood.length === 0) {
    return null;
  }
  return (
    <>
      {foodInfo.recommendedFood.map((higherFoodId: number, index: number) => (
        <>
          <ItemLink id={higherFoodId} key={index} />
          &nbsp;
        </>
      ))}
    </>
  );
};

const DebugText = () => {
  return (
    <>
      {Object.keys(FOOD_MAPPINGS).map((spellId: string, index: number) => {
        return (
          <>
            <hr />
            <ItemLink id={FOOD_MAPPINGS[Number(spellId)].itemId} key={index} />
            <br />
            <RecommendedFoodList spellId={Number(spellId)} />
          </>
        );
      })}
    </>
  );
};

class FoodChecker extends Analyzer {
  midTierFoodUp = false;
  higherFoodUp = false;
  activeFoodSpellId?: number;
  recommendedHigherTierFoods?: number[];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this.onApplybuff.bind(this));
  }

  onApplybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;

    if (event.prepull) {
      if (FOOD_MAPPINGS[spellId]) {
        this.activeFoodSpellId = spellId;
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
    if (DEBUG) {
      return {
        actual: true,
        isEqual: true,
        style: ThresholdStyle.BOOLEAN,
      };
    }

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

  get SuggestionText() {
    if (DEBUG) {
      return <DebugText />;
    }
    if (!this.higherFoodUp && !this.midTierFoodUp) {
      return (
        <>
          You did not have any food active when starting the fight. Having the right food buff
          during combat is an easy way to improve performance.
        </>
      );
    }
    if (this.midTierFoodUp) {
      return (
        <>
          <>
            You did not have the best food active when starting the fight. Using the best food
            available is an easy way to improve performance.
          </>
          {this.recommendedHigherTierFoods &&
            this.recommendedHigherTierFoods.length > 0 &&
            this.activeFoodSpellId && (
              <>
                Instead of using <ItemLink id={FOOD_MAPPINGS[this.activeFoodSpellId].itemId} />, try
                one of these: <RecommendedFoodList spellId={this.activeFoodSpellId} />
              </>
            )}
        </>
      );
    }
  }

  get suggestionImportance() {
    if (DEBUG) {
      return SUGGESTION_IMPORTANCE.MAJOR;
    }

    if (!this.higherFoodUp && !this.midTierFoodUp) {
      return SUGGESTION_IMPORTANCE.MAJOR;
    }
    return SUGGESTION_IMPORTANCE.MINOR;
  }

  suggestions(when: When) {
    when(this.higherFoodSuggestionThresholds).addSuggestion((suggest) =>
      suggest(this.SuggestionText)
        .icon(SPELLS.FATED_FORTUNE_COOKIE.icon)
        .staticImportance(this.suggestionImportance),
    );
  }
}

export default FoodChecker;
