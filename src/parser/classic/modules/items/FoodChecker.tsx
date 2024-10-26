import SPELLS from 'common/SPELLS';
import { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { ItemLink } from 'interface';
import BaseFoodChecker from 'parser/shared/modules/items/FoodChecker';
import { Fragment } from 'react';
import items from 'common/ITEMS/classic/cooking';

const BAKED_ROCKFISH = items.BAKED_ROCKFISH.id; // https://www.wowhead.com/cata/item=62661
const BASILISK_LIVERDOG = items.BASILISK_LIVERDOG.id; // https://www.wowhead.com/cata/item=62665
const BEER_BASTED_CROCOLISK = items.BEER_BASTED_CROCOLISK.id; // https://www.wowhead.com/cata/item=62670
const BLACKBELLY_SUSHI = items.BLACKBELLY_SUSHI.id; // https://www.wowhead.com/cata/item=62668
const BROILED_DRAGON_FEAST = items.BROILED_DRAGON_FEAST.id; // https://www.wowhead.com/cata/item=62289
const CRISPY_BAKON_SNACK = items.CRISPY_BAKON_SNACK.id; // https://www.wowhead.com/cata/item=62678
const CROCOLISK_AU_GRATIN = items.CROCOLISK_AU_GRATIN.id; // https://www.wowhead.com/cata/item=62664
const DELICIOUS_SAGEFISH_TAIL = items.DELICIOUS_SAGEFISH_TAIL.id; // https://www.wowhead.com/cata/item=62666
const ENRICHED_FISH_BISCUIT = items.ENRICHED_FISH_BISCUIT.id; // https://www.wowhead.com/cata/item=62679
const FORTUNE_COOKIE = items.FORTUNE_COOKIE.id; // https://www.wowhead.com/cata/item=62649
const GOBLIN_BARBECUE = items.GOBLIN_BARBECUE.id; // https://www.wowhead.com/cata/item=60858
const GRILLED_DRAGON = items.GRILLED_DRAGON.id; // https://www.wowhead.com/cata/item=62662
const LAVASCALE_MINESTRONE = items.LAVASCALE_MINESTRONE.id; // https://www.wowhead.com/cata/item=62663
const MUSHROOM_SAUCE_MUDFISH = items.MUSHROOM_SAUCE_MUDFISH.id; // https://www.wowhead.com/cata/item=62667
const SEAFOOD_MAGNIFIQUE_FEAST = items.SEAFOOD_MAGNIFIQUE_FEAST.id; // https://www.wowhead.com/cata/item=62290
const SEVERED_SAGEFISH_HEAD = items.SEVERED_SAGEFISH_HEAD.id; // https://www.wowhead.com/cata/item=62671
const SKEWERED_EEL = items.SKEWERED_EEL.id; // https://www.wowhead.com/cata/item=62669

interface FoodInfo {
  itemId: number;
  recommendedFood?: number[];
}

const FOOD_MAPPINGS: { [spellId: number]: FoodInfo } = {
  // 90 Stamina + 90 of another useful stat
  87644: { itemId: SEAFOOD_MAGNIFIQUE_FEAST }, // Cast
  87806: { itemId: SEAFOOD_MAGNIFIQUE_FEAST }, // Eating Buff
  87604: { itemId: FORTUNE_COOKIE }, // Cast
  87628: { itemId: FORTUNE_COOKIE }, // Eating Buff

  // 90 Agility + 90 Stamina
  87546: { itemId: SKEWERED_EEL }, // Food Buff
  87586: { itemId: SKEWERED_EEL }, // Cast

  // 90 Critical Strike + 90 Stamina
  87551: { itemId: BAKED_ROCKFISH }, // Food Buff
  87597: { itemId: BAKED_ROCKFISH }, // Cast

  // 90 Dodge Rating + 90 Stamina
  87554: { itemId: MUSHROOM_SAUCE_MUDFISH }, // Food Buff
  87601: { itemId: MUSHROOM_SAUCE_MUDFISH }, // Cast

  // 90 Expertise + 90 Stamina
  87635: { itemId: CROCOLISK_AU_GRATIN }, // Food Buff
  87637: { itemId: CROCOLISK_AU_GRATIN }, // Cast

  // 90 Haste Rating + 90 Stamina
  87599: { itemId: BASILISK_LIVERDOG }, // Food Buff
  87552: { itemId: BASILISK_LIVERDOG }, // Cast

  // 90 Hit Rating + 90 Stamina
  87550: { itemId: GRILLED_DRAGON }, // Food Buff
  87595: { itemId: GRILLED_DRAGON }, // Cast

  // 90 Intellect + 90 Stamina
  87547: { itemId: SEVERED_SAGEFISH_HEAD }, // Food Buff
  87587: { itemId: SEVERED_SAGEFISH_HEAD }, // Cast

  // 90 Mastery + 90 Stamina
  87549: { itemId: LAVASCALE_MINESTRONE }, // Food Buff
  87594: { itemId: LAVASCALE_MINESTRONE }, // Cast

  // 90 Parry Rating + 90 Stamina
  87555: { itemId: BLACKBELLY_SUSHI }, // Food Buff
  87602: { itemId: BLACKBELLY_SUSHI }, // Cast

  // 90 Spirit + 90 Stamina
  87548: { itemId: DELICIOUS_SAGEFISH_TAIL }, // Food Buff
  87588: { itemId: DELICIOUS_SAGEFISH_TAIL }, // Cast

  // 90 Strength + 90 Stamina
  87545: { itemId: BEER_BASTED_CROCOLISK }, // Food Buff
  87584: { itemId: BEER_BASTED_CROCOLISK }, // Cast

  // 60 Stamina + 60 in another useful stat
  87643: { itemId: BROILED_DRAGON_FEAST, recommendedFood: [SEAFOOD_MAGNIFIQUE_FEAST] }, // Cast
  87915: { itemId: GOBLIN_BARBECUE, recommendedFood: [FORTUNE_COOKIE] }, // Cast

  // Pet Strength +75
  87697: { itemId: CRISPY_BAKON_SNACK }, // Food Buff
  // Pet Stamina +110
  87699: { itemId: ENRICHED_FISH_BISCUIT }, // Food Buff
};

// Setting this to true replaces the food suggestion with a list of the
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
        <Fragment key={higherFoodId}>
          <ItemLink id={higherFoodId} key={index} />
          &nbsp;
        </Fragment>
      ))}
    </>
  );
};

const DebugText = () => {
  return (
    <>
      {Object.keys(FOOD_MAPPINGS).map((spellId: string, index: number) => {
        return (
          <Fragment key={spellId}>
            <hr />
            <ItemLink id={FOOD_MAPPINGS[Number(spellId)].itemId} key={index} />
            <br />
            <RecommendedFoodList spellId={Number(spellId)} />
          </Fragment>
        );
      })}
    </>
  );
};

class FoodChecker extends BaseFoodChecker {
  recommendedHigherTierFoods?: number[];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this.onApplybuff.bind(this));
  }

  onApplybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;

    if (event.prepull) {
      if (FOOD_MAPPINGS[spellId]) {
        this.foodBuffId = spellId;
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
            this.foodBuffId && (
              <>
                Instead of using <ItemLink id={FOOD_MAPPINGS[this.foodBuffId].itemId} />, try one of
                these: <RecommendedFoodList spellId={this.foodBuffId} />
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
