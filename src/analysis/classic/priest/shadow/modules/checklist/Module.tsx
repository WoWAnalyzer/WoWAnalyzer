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
import ShadowWordPain from 'analysis/classic/priest/shadow/modules/features/ShadowWordPain';
import VampiricTouch from 'analysis/classic/priest/shadow/modules/features/VampiricTouch';
import DevouringPlague from 'analysis/classic/priest/shadow/modules/features/DevouringPlague';

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
    shadowWordPain: ShadowWordPain,
    vampiricTouch: VampiricTouch,
    devouringPlague: DevouringPlague,
  };

  // Shared
  protected castEfficiency!: CastEfficiency;
  protected combatants!: Combatants;
  protected combatPotionChecker!: CombatPotionChecker;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  // Features
  protected alwaysBeCasting!: AlwaysBeCasting;
  // Spells
  protected shadowWordPain!: ShadowWordPain;
  protected vampiricTouch!: VampiricTouch;
  protected devouringPlague!: DevouringPlague;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          // Spells
          shadowWordPain: this.shadowWordPain.uptimeSuggestionThresholds,
          vampiricTouch: this.vampiricTouch.suggestionThresholds,
          devouringPlague: this.devouringPlague.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
