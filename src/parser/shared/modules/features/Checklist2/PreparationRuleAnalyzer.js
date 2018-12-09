import Analyzer from 'parser/core/Analyzer';
import PrePotion from 'parser/shared/modules/items/PrePotion';
import EnchantChecker from 'parser/shared/modules/items/EnchantChecker';
import FlaskChecker from 'parser/shared/modules/items/FlaskChecker';
import FoodChecker from 'parser/shared/modules/items/FoodChecker';

class PreparationRuleAnalyzer extends Analyzer {
  static dependencies = {
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,
    flaskChecker: FlaskChecker,
    foodChecker: FoodChecker,
  };

  get thresholds() {
    return {
      prePotion: this.prePotion.prePotionSuggestionThresholds,
      secondPotion: this.prePotion.secondPotionSuggestionThresholds,
      itemsEnchanted: {
        actual: this.enchantChecker.numEnchantableGear - this.enchantChecker.numSlotsMissingEnchant,
        max: this.enchantChecker.numEnchantableGear,
        isLessThan: this.enchantChecker.numEnchantableGear,
        style: 'number',
      },
      itemsBestEnchanted: {
        // numSlotsMissingMaxEnchant doesn't include items without an enchant at all
        actual: this.enchantChecker.numEnchantableGear - this.enchantChecker.numSlotsMissingEnchant - this.enchantChecker.numSlotsMissingMaxEnchant,
        max: this.enchantChecker.numEnchantableGear,
        isLessThan: this.enchantChecker.numEnchantableGear,
        style: 'number',
      },
      flaskPresent: this.flaskChecker.flaskSuggestionThresholds,
      higherfoodPresent: this.foodChecker.higherFoodSuggestionThresholds,
      foodPresent: this.foodChecker.isPresentFoodSuggestionThresholds,

    };
  }

}

export default PreparationRuleAnalyzer;
