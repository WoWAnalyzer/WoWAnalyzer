// Core
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import Component from './Component';
// Shared
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import CombatPotionChecker from 'parser/classic/modules/items/CombatPotionChecker';
import PreparationRuleAnalyzer from 'parser/classic/modules/features/Checklist/PreparationRuleAnalyzer';
// Features
import AlwaysBeCasting from '../features/AlwaysBeCasting';
// Spells
import HolyShield from '../spells/HolyShield';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    // Shared
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    combatPotionChecker: CombatPotionChecker,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    // Features
    alwaysBeCasting: AlwaysBeCasting,
    // Spells
    holyShield: HolyShield,
  };

  // Shared
  protected castEfficiency!: CastEfficiency;
  protected combatants!: Combatants;
  protected combatPotionChecker!: CombatPotionChecker;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  // Features
  protected alwaysBeCasting!: AlwaysBeCasting;
  // Spells
  protected holyShield!: HolyShield;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          // Spells
          holyShieldPrepull: this.holyShield.suggestionThresholdsPrepull,
          holyShieldUptime: this.holyShield.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
