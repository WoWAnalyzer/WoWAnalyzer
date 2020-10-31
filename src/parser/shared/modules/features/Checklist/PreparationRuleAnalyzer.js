import Analyzer from 'parser/core/Analyzer';
import PotionChecker from 'parser/shared/modules/items/PotionChecker';
import EnchantChecker from 'parser/shared/modules/items/EnchantChecker';
import FlaskChecker from 'parser/shared/modules/items/FlaskChecker';
import FoodChecker from 'parser/shared/modules/items/FoodChecker';
import { ThresholdStyle } from 'parser/core/ParseResults';

class PreparationRuleAnalyzer extends Analyzer {
  static dependencies = {
    potionChecker: PotionChecker,
    enchantChecker: EnchantChecker,
    flaskChecker: FlaskChecker,
    foodChecker: FoodChecker,
  };

  get thresholds() {
    return {
      potionsUsed: {
        actual: this.potionChecker.potionsUsed,
        max: this.potionChecker.maxPotions,
        isLessThan: this.potionChecker.maxPotions,
        style: ThresholdStyle.NUMBER,
      },
      bestPotionUsed: {
        actual: this.potionChecker.strongPotionsUsed,
        max: this.potionChecker.maxPotions,
        isLessThan: this.potionChecker.maxPotions,
        style: ThresholdStyle.NUMBER,
      },
      itemsEnchanted: {
        actual: this.enchantChecker.numEnchantableGear - this.enchantChecker.numSlotsMissingEnchant,
        max: this.enchantChecker.numEnchantableGear,
        isLessThan: this.enchantChecker.numEnchantableGear,
        style: ThresholdStyle.NUMBER,
      },
      itemsBestEnchanted: {
        // numSlotsMissingMaxEnchant doesn't include items without an enchant at all
        actual: this.enchantChecker.numEnchantableGear - this.enchantChecker.numSlotsMissingEnchant - this.enchantChecker.numSlotsMissingMaxEnchant,
        max: this.enchantChecker.numEnchantableGear,
        isLessThan: this.enchantChecker.numEnchantableGear,
        style: ThresholdStyle.NUMBER,
      },
      higherFlaskPresent: this.flaskChecker.flaskStrengthSuggestion,
      flaskPresent: this.flaskChecker.flaskSuggestionThresholds,
      higherFoodPresent: this.foodChecker.higherFoodSuggestionThresholds,
      foodPresent: this.foodChecker.isPresentFoodSuggestionThresholds,

    };
  }

}

export default PreparationRuleAnalyzer;
