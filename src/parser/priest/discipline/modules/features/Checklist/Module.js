import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import CastEfficiency from 'parser/core/modules/CastEfficiency';
import Combatants from 'parser/core/modules/Combatants';
import ManaValues from 'parser/core/modules/ManaValues';
import PreparationRuleAnalyzer from 'parser/core/modules/features/Checklist2/PreparationRuleAnalyzer';

import AlwaysBeCasting from '../AlwaysBeCasting';

import Component from './Component';

class Checklist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    manaValues: ManaValues,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          nonHealingTimeSuggestionThresholds: this.alwaysBeCasting.nonHealingTimeSuggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          manaLeft: this.manaValues.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
