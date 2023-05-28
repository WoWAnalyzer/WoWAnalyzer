import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import PreparationRuleAnalyzer from 'parser/classic/modules/features/Checklist/PreparationRuleAnalyzer';
// Features
import AlwaysBeCasting from '../features/AlwaysBeCasting';
// Spells
import Corruption from '../spells/Corruption';
import CurseOfAgony from '../spells/CurseOfAgony';
import Haunt from '../spells/Haunt';
import UnstableAffliction from '../spells/UnstableAffliction';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    alwaysBeCasting: AlwaysBeCasting,
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    corruption: Corruption,
    curseOfAgony: CurseOfAgony,
    haunt: Haunt,
    unstableAffliction: UnstableAffliction,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
  };
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected castEfficiency!: CastEfficiency;
  protected combatants!: Combatants;
  protected corruption!: Corruption;
  protected curseOfAgony!: CurseOfAgony;
  protected haunt!: Haunt;
  protected unstableAffliction!: UnstableAffliction;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          corruption: this.corruption.suggestionThresholds,
          curseOfAgony: this.curseOfAgony.suggestionThresholds,
          haunt: this.haunt.suggestionThresholds,
          unstableAffliction: this.unstableAffliction.suggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
