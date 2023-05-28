import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import AugmentRuneChecker from 'parser/retail/modules/items/AugmentRuneChecker';
import EnchantChecker from 'parser/retail/modules/items/EnchantChecker';
import FlaskChecker from 'parser/retail/modules/items/FlaskChecker';
import FoodChecker from 'parser/retail/modules/items/FoodChecker';
import PotionChecker from 'parser/retail/modules/items/PotionChecker';
import WeaponEnhancementChecker from 'parser/retail/modules/items/WeaponEnhancementChecker';

class PreparationRuleAnalyzer extends Analyzer {
  static dependencies = {
    potionChecker: PotionChecker,
    enchantChecker: EnchantChecker,
    weaponEnhancementChecker: WeaponEnhancementChecker,
    flaskChecker: FlaskChecker,
    foodChecker: FoodChecker,
    augmentRuneChecker: AugmentRuneChecker,
  };

  protected potionChecker!: PotionChecker;
  protected enchantChecker!: EnchantChecker;
  protected weaponEnhancementChecker!: WeaponEnhancementChecker;
  protected flaskChecker!: FlaskChecker;
  protected foodChecker!: FoodChecker;
  protected augmentRuneChecker!: AugmentRuneChecker;

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
      itemsEnchanted: this.enchantChecker.itemsEnchantedThreshold,
      itemsBestEnchanted: this.enchantChecker.itemsBestEnchantedThreshold,
      weaponsEnhanced: this.weaponEnhancementChecker.weaponsEnhancedThreshold,
      bestWeaponEnhancements: this.weaponEnhancementChecker.bestWeaponEnhancementsThreshold,
      higherFlaskPresent: this.flaskChecker.flaskStrengthSuggestion,
      flaskPresent: this.flaskChecker.flaskSuggestionThresholds,
      higherFoodPresent: this.foodChecker.higherFoodSuggestionThresholds,
      foodPresent: this.foodChecker.isPresentFoodSuggestionThresholds,
      augmentRunePresent: this.augmentRuneChecker.augmentRuneSuggestionThresholds,
    };
  }
}

export default PreparationRuleAnalyzer;
