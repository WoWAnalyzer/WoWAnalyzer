import Analyzer from 'parser/core/Analyzer';
import CombatPotionChecker from 'parser/classic/modules/items/CombatPotionChecker';
import EnchantChecker from 'parser/classic/modules/items/EnchantChecker';
import FlaskChecker from 'parser/classic/modules/items/FlaskChecker';
import FoodChecker from 'parser/classic/modules/items/FoodChecker';

class PreparationRuleAnalyzer extends Analyzer {
  static dependencies = {
    foodChecker: FoodChecker,
    enchantChecker: EnchantChecker,
    flaskChecker: FlaskChecker,
    combatPotionChecker: CombatPotionChecker,
  };

  protected enchantChecker!: EnchantChecker;
  protected foodChecker!: FoodChecker;
  protected flaskChecker!: FlaskChecker;
  protected combatPotionChecker!: CombatPotionChecker;

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
      combatPotionThresholds: this.combatPotionChecker.suggestionThresholds,
    };
  }
}

export default PreparationRuleAnalyzer;
