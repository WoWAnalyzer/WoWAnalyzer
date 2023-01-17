// Core
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import Component from './Component';
// Shared
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import CombatPotionChecker from 'parser/classic/modules/items/CombatPotionChecker';
import ManaValues from 'parser/shared/modules/ManaValues';
import PreparationRuleAnalyzer from 'parser/classic/modules/features/Checklist/PreparationRuleAnalyzer';
// Features
import AlwaysBeCasting from '../features/AlwaysBeCasting';

class Checklist extends BaseChecklist {
  static dependencies = {
    // Core
    ...BaseChecklist.dependencies,
    // Shared
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    combatPotionChecker: CombatPotionChecker,
    manaValues: ManaValues,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    // Features
    alwaysBeCasting: AlwaysBeCasting,
  };

  // Shared
  protected castEfficiency!: CastEfficiency;
  protected combatants!: Combatants;
  protected combatPotionChecker!: CombatPotionChecker;
  protected manaValues!: ManaValues;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  // Features
  protected alwaysBeCasting!: AlwaysBeCasting;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          manaLeft: this.manaValues.suggestionThresholds,
          nonHealingTimeSuggestionThresholds: this.alwaysBeCasting
            .nonHealingTimeSuggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
