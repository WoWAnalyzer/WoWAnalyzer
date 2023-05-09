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
import ShadowyInsight from '../spells/ShadowyInsight';
import UnfurlingDarkness from '../talents/UnfurlingDarkness';
import Deathspeaker from '../talents/Deathspeaker';
import MindSpikeInsanity from '../talents/MindSpikeInsanity';
import MindFlayInsanity from '../talents/MindFlayInsanity';
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
    deathspeaker: Deathspeaker,
    mindDevourer: MindDevourer,
    mindSpikeInsanity: MindSpikeInsanity,
    mindFlayInsanity: MindFlayInsanity,
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
  protected deathspeaker!: Deathspeaker;
  protected mindDevourer!: MindDevourer;
  protected mindSpikeInsanity!: MindSpikeInsanity;
  protected mindFlayInsanity!: MindFlayInsanity;

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
          deathspeaker: this.deathspeaker.suggestionThresholds,
          mindDevourer: this.mindDevourer.suggestionThresholds,
          mindSpikeInsanity: this.mindSpikeInsanity.suggestionThresholds,
          mindFlayInsanity: this.mindFlayInsanity.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
