import PreparationRuleAnalyzer from 'parser/shadowlands/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import ManaValues from 'parser/shared/modules/ManaValues';

import Cultivation from '../../talents/Cultivation';
import SpringBlossoms from '../../talents/SpringBlossoms';
import TreeOfLife from '../../talents/TreeOfLife';
import AlwaysBeCasting from '../AlwaysBeCasting';
import Efflorescence from '../Efflorescence';
import Innervate from '../Innervate';
import Lifebloom from '../Lifebloom';
import RegrowthAndClearcasting from '../RegrowthAndClearcasting';
import WildGrowth from '../WildGrowth';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    alwaysBeCasting: AlwaysBeCasting,
    wildGrowth: WildGrowth,
    lifebloom: Lifebloom,
    efflorescence: Efflorescence,
    innervate: Innervate,
    regrowthAndClearcasting: RegrowthAndClearcasting,
    manaValues: ManaValues,
    cultivation: Cultivation,
    springBlossoms: SpringBlossoms,
    treeOfLife: TreeOfLife,
  };

  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected wildGrowth!: WildGrowth;
  protected lifebloom!: Lifebloom;
  protected efflorescence!: Efflorescence;
  protected innervate!: Innervate;
  protected regrowthAndClearcasting!: RegrowthAndClearcasting;
  protected manaValues!: ManaValues;
  protected cultivation!: Cultivation;
  protected springBlossoms!: SpringBlossoms;
  protected treeOfLife!: TreeOfLife;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          downtime: this.alwaysBeCasting.downtimeSuggestionThresholds,
          nonHealingTime: this.alwaysBeCasting.nonHealingTimeSuggestionThresholds,
          wildGrowthRatio: this.wildGrowth.suggestionThresholds,
          wildGrowthPercentIneffectiveCasts: this.wildGrowth
            .suggestionPercentIneffectiveCastsThresholds,
          lifebloomUpTime: this.lifebloom.suggestionThresholds,
          efflorescenceUpTime: this.efflorescence.suggestionThresholds,
          innervateManaSaved: this.innervate.manaSavedThresholds,
          innervateSelfCasts: this.innervate.selfCastThresholds,
          clearCastingUtil: this.regrowthAndClearcasting.clearcastingUtilSuggestionThresholds,
          badRegrowths: this.regrowthAndClearcasting.badRegrowthsSuggestionThresholds,
          manaValues: this.manaValues.suggestionThresholds,
          cultivationPercent: this.cultivation.suggestionThresholds,
          springBlossomsPercent: this.springBlossoms.suggestionThresholds,
          treeOfLifePercent: this.treeOfLife.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
