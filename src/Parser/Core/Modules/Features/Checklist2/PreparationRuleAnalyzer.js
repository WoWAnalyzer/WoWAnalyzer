import Analyzer from 'Parser/Core/Analyzer';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';

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
