import Analyzer from 'parser/core/Analyzer';
import PrePotion from 'parser/core/modules/items/PrePotion';
import EnchantChecker from 'parser/core/modules/items/EnchantChecker';

class PreparationRuleAnalyzer extends Analyzer {
  static dependencies = {
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,
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

    };
  }

}

export default PreparationRuleAnalyzer;
