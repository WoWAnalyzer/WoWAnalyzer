import { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import SUGGESTION_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { ThresholdStyle } from 'parser/core/ParseResults';
import { ItemLink } from 'interface';
import BaseFoodChecker from 'parser/shared/modules/items/FoodChecker';
import { Fragment } from 'react';
import items from 'common/ITEMS/classic/cooking';
import { Food } from 'common/ITEMS/Item';
import { PRIMARY_STAT } from 'parser/shared/modules/features/STAT';

interface FoodInfo {
  itemId: number;
  recommendedFood?: number[];
}

const FOOD_MAPPINGS: Record<number, FoodInfo> = Object.fromEntries(
  Object.values(items)
    .filter((item): item is Food => 'buffId' in item)
    .map((item) => [item.buffId, { itemId: item.id }]),
);

// this is my best guess at recommended foods from looking at guides. none that i saw recommend secondary stat
// food, and all the healer guides on wowhead recommend intellect food---not spirit.

// TODO 300 primary noodle cart buff?
const RECOMMENDED_FOODS = {
  // 300 strength
  [PRIMARY_STAT.STRENGTH]: [items.BLACK_PEPPER_RIBS_AND_SHRIMP, items.FLUFFY_SILKFEATHER_OMELET],
  // 300 agility
  [PRIMARY_STAT.AGILITY]: [items.SEA_MIST_RICE_NOODLES, items.SEASONED_POMFRUIT_SLICES],
  // 300 intellect
  [PRIMARY_STAT.INTELLECT]: [items.MOGU_FISH_STEW, items.SPICED_BLOSSOM_SOUP],
};

function isRecommendedFood(spellId: number, stat: PRIMARY_STAT): boolean {
  const recommended = RECOMMENDED_FOODS[stat];
  return recommended.map((item) => item.buffId).includes(spellId);
}

// Setting this to true replaces the food suggestion with a list of the
// defined foods and their recommendedFoods. This is useful for sanity checking
// the list of foods you are marking as upgrades.
const DEBUG = false;

const RecommendedFoodList = ({ spellId, primary }: { spellId: number; primary: PRIMARY_STAT }) => {
  const recommended = RECOMMENDED_FOODS[primary];
  if (recommended.map((item) => item.buffId).includes(spellId)) {
    return null;
  }

  return (
    <>
      {recommended.map((higherFood: Food) => (
        <Fragment key={higherFood.id}>
          <ItemLink id={higherFood.id} />
          &nbsp;
        </Fragment>
      ))}
    </>
  );
};

const DebugText = ({ stat }: { stat: PRIMARY_STAT }) => {
  return (
    <>
      {Object.keys(FOOD_MAPPINGS).map((spellId: string, index: number) => {
        return (
          <Fragment key={spellId}>
            <hr />
            <ItemLink id={FOOD_MAPPINGS[Number(spellId)].itemId} key={index} />
            <br />
            <RecommendedFoodList spellId={Number(spellId)} primary={stat} />
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
        if (isRecommendedFood(spellId, this.config.spec.primaryStat)) {
          this.higherFoodUp = true;
        } else {
          this.midTierFoodUp = true;
          this.recommendedHigherTierFoods = RECOMMENDED_FOODS[this.config.spec.primaryStat].map(
            (food) => food.id,
          );
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
      return <DebugText stat={this.config.spec.primaryStat} />;
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
                these:{' '}
                <RecommendedFoodList
                  spellId={this.foodBuffId}
                  primary={this.config.spec.primaryStat}
                />
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
}

export default FoodChecker;
