import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import AlwaysBeCasting from '../features/AlwaysBeCasting';
import InsanityUsage from '../resources/InsanityUsage';
import ShadowWordPain from '../spells/ShadowWordPain';
import VampiricTouch from '../spells/VampiricTouch';
import DevouringPlague from '../spells/DevouringPlague';
import DarkEvangelism from '../talents/DarkEvangelism';
import ShadowyInsight from '../features/ShadowyInsight';
import UnfurlingDarkness from '../talents/UnfurlingDarkness';
import SurgeOfDarkness from '../talents/SurgeOfDarkness';
import MindDevourer from '../talents/MindDevourer';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    insanityUsage: InsanityUsage,
    shadowWordPain: ShadowWordPain,
    vampiricTouch: VampiricTouch,
    devouringPlague: DevouringPlague,
    darkEvangelism: DarkEvangelism,
    shadowyInsight: ShadowyInsight,
    unfurlingDarkness: UnfurlingDarkness,
    mindDevourer: MindDevourer,
    surgeOfDarkness: SurgeOfDarkness,
  };

  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected insanityUsage!: InsanityUsage;
  protected shadowWordPain!: ShadowWordPain;
  protected vampiricTouch!: VampiricTouch;
  protected devouringPlague!: DevouringPlague;
  protected darkEvangelism!: DarkEvangelism;
  protected shadowyInsight!: ShadowyInsight;
  protected unfurlingDarkness!: UnfurlingDarkness;
  protected mindDevourer!: MindDevourer;
  protected surgeOfDarkness!: SurgeOfDarkness;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          insanityUsage: this.insanityUsage.suggestionThresholds,
          shadowWordPain: this.shadowWordPain.suggestionThresholds,
          vampiricTouch: this.vampiricTouch.suggestionThresholds,
          devouringPlague: this.devouringPlague.suggestionThresholds,
          darkEvangelism: this.darkEvangelism.suggestionThresholds,
          downtime: this.alwaysBeCasting.suggestionThresholds,
          shadowyInsight: this.shadowyInsight.suggestionThresholds,
          unfurlingDarkness: this.unfurlingDarkness.suggestionThresholds,
          mindDevourer: this.mindDevourer.suggestionThresholds,
          surgeOfDarkness: this.surgeOfDarkness.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
