import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';

class FoodChecker extends Analyzer {
  lowerFoodUp = false;
  midTierFoodUp = false;
  higherFoodUp = false;
  foodBuffId?: number;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER), this.onApplybuff.bind(this));
  }

  get lowerFoodIds(): number[] {
    return [];
  }

  get midFoodIds(): number[] {
    return [];
  }

  get highFoodIds(): number[] {
    return [];
  }

  onApplybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (event.prepull) {
      if (this.lowerFoodIds.includes(spellId)) {
        this.lowerFoodUp = true;
        this.foodBuffId = spellId;
      }
      if (this.highFoodIds.includes(spellId)) {
        this.higherFoodUp = true;
        this.foodBuffId = spellId;
      }
      if (this.midFoodIds.includes(spellId)) {
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
}
export default FoodChecker;
