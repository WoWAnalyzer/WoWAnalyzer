import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist2/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist2/PreparationRuleAnalyzer';
import ManaValues from 'parser/shared/modules/ManaValues';

import AlwaysBeCasting from '../AlwaysBeCasting';
import Clearcasting from '../Clearcasting';
import Lifebloom from '../Lifebloom';
import Efflorescence from '../Efflorescence';
import Innervate from '../Innervate';
import WildGrowth from '../WildGrowth';

import Cultivation from '../../talents/Cultivation';
import SpringBlossoms from '../../talents/SpringBlossoms';
import TreeOfLife from '../../talents/TreeOfLife';

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
          wildGrowthPercentBelowRecommendedCasts: this.wildGrowth.suggestionpercentBelowRecommendedCastsThresholds,
          wildGrowthPercentBelowRecommendedPrecasts: this.wildGrowth.suggestionpercentBelowRecommendedPrecastsThresholds,
          lifebloomUpTime: this.lifebloom.suggestionThresholds,
          efflorescenceUpTime: this.efflorescence.suggestionThresholds,
          innervateAverageManaSaved: this.innervate.averageManaSavedSuggestionThresholds,
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
