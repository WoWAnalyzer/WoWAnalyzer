import React from 'react';

import BaseModule from 'parser/shared/modules/features/Checklist2/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist2/PreparationRuleAnalyzer';

import AlwaysBeCasting from '../AlwaysBeCasting';
import RunicPowerDetails from '../../runicpower/RunicPowerDetails';
import RuneTracker from '../RuneTracker';

import Component from './Component';

class Checklist extends BaseModule {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    runicPowerDetails: RunicPowerDetails,
    runeTracker: RuneTracker,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          runeEfficiency: this.runeTracker.suggestionThresholdsEfficiency,
          runicPowerEfficiency: this.runicPowerDetails.efficiencySuggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
