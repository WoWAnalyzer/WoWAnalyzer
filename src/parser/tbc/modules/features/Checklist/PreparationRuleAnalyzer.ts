import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import EnchantChecker from 'parser/tbc/modules/items/EnchantChecker';
import FoodChecker from 'parser/tbc/modules/items/FoodChecker';

class PreparationRuleAnalyzer extends Analyzer {
  static dependencies = {
    foodChecker: FoodChecker,
    enchantChecker: EnchantChecker,
  };

  protected enchantChecker!: EnchantChecker;
  protected foodChecker!: FoodChecker;

  get thresholds() {
    return {
      itemsEnchanted: {
        actual: this.enchantChecker.numEnchantableGear - this.enchantChecker.numSlotsMissingEnchant,
        max: this.enchantChecker.numEnchantableGear,
        isLessThan: this.enchantChecker.numEnchantableGear,
        style: ThresholdStyle.NUMBER,
      },
      itemsBestEnchanted: {
        // numSlotsMissingMaxEnchant doesn't include items without an enchant at all
        actual:
          this.enchantChecker.numEnchantableGear -
          this.enchantChecker.numSlotsMissingEnchant -
          this.enchantChecker.numSlotsMissingMaxEnchant,
        max: this.enchantChecker.numEnchantableGear,
        isLessThan: this.enchantChecker.numEnchantableGear,
        style: ThresholdStyle.NUMBER,
      },
      higherFoodPresent: this.foodChecker.higherFoodSuggestionThresholds,
      foodPresent: this.foodChecker.isPresentFoodSuggestionThresholds,
    };
  }
}

export default PreparationRuleAnalyzer;
