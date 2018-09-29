import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import CastEfficiency from 'parser/core/modules/CastEfficiency';
import Combatants from 'parser/core/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/core/modules/features/Checklist2/PreparationRuleAnalyzer';

import AlwaysBeCasting from '../AlwaysBeCasting';
import MissedRampage from '../../Spells/MissedRampage';

import Component from './Component';

class Checklist extends Analyzer {
  static dependencies = {
    alwaysBeCasting: AlwaysBeCasting,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    missedRampage: MissedRampage,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          missedRampage: this.missedRampage.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
