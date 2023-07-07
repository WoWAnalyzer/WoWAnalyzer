import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
// Shared
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
// Features
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import CurseUptime from '../features/CurseUptime';
import PreparationRuleAnalyzer from 'parser/classic/modules/features/Checklist/PreparationRuleAnalyzer';
// Spells
import Corruption from '../spells/Corruption';
import CurseOfAgony from '../spells/CurseOfAgony';
import CurseOfDoom from '../spells/CurseOfDoom';
import CurseOfTheElements from '../spells/CurseOfTheElements';
import Immolate from '../spells/Immolate';
import MoltenCore from '../spells/MoltenCore';
import ShadowMastery from '../spells/ShadowMastery';

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
    curseUptime: CurseUptime,
    // Spells
    corruption: Corruption,
    curseOfAgony: CurseOfAgony,
    curseOfDoom: CurseOfDoom,
    curseOfTheElements: CurseOfTheElements,
    immolate: Immolate,
    moltenCore: MoltenCore,
    shadowMastery: ShadowMastery,
  };
  protected castEfficiency!: CastEfficiency;
  protected combatants!: Combatants;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected curseUptime!: CurseUptime;
  protected corruption!: Corruption;
  protected curseOfAgony!: CurseOfAgony;
  protected curseOfDoom!: CurseOfDoom;
  protected curseOfTheElements!: CurseOfTheElements;
  protected immolate!: Immolate;
  protected moltenCore!: MoltenCore;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected shadowMastery!: ShadowMastery;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          corruption: this.corruption.suggestionThresholds,
          curseOfAgony: this.curseOfAgony.suggestionThresholds,
          curseOfDoom: this.curseOfDoom.suggestionThresholds,
          curseOfTheElements: this.curseOfTheElements.suggestionThresholds,
          curseUptime: this.curseUptime.suggestionThresholds,
          immolate: this.immolate.suggestionThresholds,
          moltenCore: this.moltenCore.suggestionThresholds,
          shadowMastery: this.shadowMastery.suggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
