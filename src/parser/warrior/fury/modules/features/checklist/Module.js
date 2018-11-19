import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist2/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist2/PreparationRuleAnalyzer';

import AlwaysBeCasting from '../AlwaysBeCasting';
import Rampage from '../../core/Rampage';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    alwaysBeCasting: AlwaysBeCasting,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    rampage: Rampage,
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
          missedRampage: this.rampage.missedSuggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
