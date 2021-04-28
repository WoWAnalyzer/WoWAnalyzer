import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';
import ManaValues from 'parser/shared/modules/ManaValues';
import React from 'react';

import Cultivation from '../../talents/Cultivation';
import SpringBlossoms from '../../talents/SpringBlossoms';
import TreeOfLife from 'analysis/druidrestoration/src/modules/talents/TreeOfLife';
import AlwaysBeCasting from '../AlwaysBeCasting';
import Clearcasting from '../Clearcasting';
import Efflorescence from '../Efflorescence';
import Innervate from '../Innervate';
import Lifebloom from '../Lifebloom';
import WildGrowth from '../WildGrowth';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    alwaysBeCasting: AlwaysBeCasting,
    wildGrowth: WildGrowth,
    lifebloom: Lifebloom,
    efflorescence: Efflorescence,
    innervate: Innervate,
    clearCasting: Clearcasting,
    manaValues: ManaValues,
    cultivation: Cultivation,
    springBlossoms: SpringBlossoms,
    treeOfLife: TreeOfLife,
  };

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
          wildGrowthPercentBelowRecommendedCasts: this.wildGrowth
            .suggestionpercentBelowRecommendedCastsThresholds,
          wildGrowthPercentBelowRecommendedPrecasts: this.wildGrowth
            .suggestionpercentBelowRecommendedPrecastsThresholds,
          lifebloomUpTime: this.lifebloom.suggestionThresholds,
          efflorescenceUpTime: this.efflorescence.suggestionThresholds,
          innervateManaSaved: this.innervate.manaSavedThresholds,
          innervateSelfCasts: this.innervate.selfCastThresholds,
          clearCastingUtil: this.clearCasting.clearcastingUtilSuggestionThresholds,
          nonCCRegrowths: this.clearCasting.nonCCRegrowthsSuggestionThresholds,
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
