import Analyzer from 'parser/core/Analyzer';
import CombatPotionChecker from 'parser/tbc/modules/items/CombatPotionChecker';
import EnchantChecker from 'parser/tbc/modules/items/EnchantChecker';
import FlaskChecker from 'parser/tbc/modules/items/FlaskChecker';
import FoodChecker from 'parser/tbc/modules/items/FoodChecker';
import WeaponEnhancementChecker from 'parser/tbc/modules/items/WeaponEnhancementChecker';

class PreparationRuleAnalyzer extends Analyzer {
  static dependencies = {
    foodChecker: FoodChecker,
    enchantChecker: EnchantChecker,
    flaskChecker: FlaskChecker,
    combatPotionChecker: CombatPotionChecker,
    weaponEnhancementChecker: WeaponEnhancementChecker,
  };

  protected enchantChecker!: EnchantChecker;
  protected foodChecker!: FoodChecker;
  protected flaskChecker!: FlaskChecker;
  protected combatPotionChecker!: CombatPotionChecker;
  protected weaponEnhancementChecker!: WeaponEnhancementChecker;

  get thresholds() {
    return {
      itemsEnchanted: this.enchantChecker.itemsEnchantedThreshold,
      itemsBestEnchanted: this.enchantChecker.itemsBestEnchantedThreshold,
      higherFoodPresent: this.foodChecker.higherFoodSuggestionThresholds,
      foodPresent: this.foodChecker.isPresentFoodSuggestionThresholds,
      flaskPresent: this.flaskChecker.FlaskSuggestionThresholds,
      battleElixirPresent: this.flaskChecker.BattleElixirSuggestionThresholds,
      guardianElixirPresent: this.flaskChecker.GuardianElixirSuggestionThresholds,
      combatPotionChecker: this.combatPotionChecker.suggestionThresholds,
      weaponsEnhanced: this.weaponEnhancementChecker.weaponsEnhancedThreshold,
      bestWeaponEnhancements: this.weaponEnhancementChecker.bestWeaponEnhancementsThreshold,
    };
  }
}

export default PreparationRuleAnalyzer;
