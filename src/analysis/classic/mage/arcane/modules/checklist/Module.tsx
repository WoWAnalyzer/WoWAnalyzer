import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
// Shared
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
// Features
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import PreparationRuleAnalyzer from 'parser/classic/modules/features/Checklist/PreparationRuleAnalyzer';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    // Shared
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    // Features
    alwaysBeCasting: AlwaysBeCasting,
    // coldSnap: ColdSnap,
  };
  protected castEfficiency!: CastEfficiency;
  protected combatants!: Combatants;
  protected alwaysBeCasting!: AlwaysBeCasting;
  // protected coldSnap!: ColdSnap;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
