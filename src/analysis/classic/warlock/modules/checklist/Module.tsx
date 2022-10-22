import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import PreparationRuleAnalyzer from 'parser/classic/modules/features/Checklist/PreparationRuleAnalyzer';

import AlwaysBeCasting from '../features/AlwaysBeCasting';
import CurseOfAgony from '../spells/CurseOfAgony';
import CurseOfDoom from '../spells/CurseOfDoom';
import CurseOfTheElements from '../spells/CurseOfTheElements';
import Curses from '../spells/Curses';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    alwaysBeCasting: AlwaysBeCasting,
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    curseOfAgony: CurseOfAgony,
    curseOfDoom: CurseOfDoom,
    curseOfTheElements: CurseOfTheElements,
    curses: Curses,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
  };
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected castEfficiency!: CastEfficiency;
  protected combatants!: Combatants;
  protected curseOfAgony!: CurseOfAgony;
  protected curseOfDoom!: CurseOfDoom;
  protected curseOfTheElements!: CurseOfTheElements;
  protected curses!: Curses;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          curseOfAgony: this.curseOfAgony.suggestionThresholds,
          curseOfDoom: this.curseOfDoom.suggestionThresholds,
          curseOfTheElements: this.curseOfTheElements.suggestionThresholds,
          curses: this.curses.suggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
