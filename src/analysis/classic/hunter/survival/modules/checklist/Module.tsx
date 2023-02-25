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
// Spells
import SerpentSting from '../spells/SerpentSting';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    // Shared
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    combatPotionChecker: CombatPotionChecker,
    manaValues: ManaValues,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    // Features
    alwaysBeCasting: AlwaysBeCasting,
    // Spells
    serpentSting: SerpentSting,
  };

  // Shared
  protected castEfficiency!: CastEfficiency;
  protected combatants!: Combatants;
  protected combatPotionChecker!: CombatPotionChecker;
  protected manaValues!: ManaValues;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  // Features
  protected alwaysBeCasting!: AlwaysBeCasting;
  // Spells
  protected serpentSting!: SerpentSting;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          manaLeft: this.manaValues.suggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          // Spells
          serpentSting: this.serpentSting.suggestionThresholds,
          // spellName: this.spellName.uptimeSuggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
