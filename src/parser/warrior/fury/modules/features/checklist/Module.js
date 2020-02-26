import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

import RageDetails from '../../core/RageDetails';
import RageTracker from '../../core/RageTracker';

import AlwaysBeCasting from '../AlwaysBeCasting';
import MissedRampage from '../../spells/MissedRampage';

import Component from './Component';

import SiegeBreaker from '../../talents/Siegebreaker'

class Checklist extends BaseChecklist {
  static dependencies = {
    alwaysBeCasting: AlwaysBeCasting,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    rageDetails: RageDetails,
    rageTracker: RageTracker,
    missedRampage: MissedRampage,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    siegeBreaker: SiegeBreaker,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          rageDetails: this.rageDetails.suggestionThresholds,
          siegeBreaker: this.siegeBreaker.suggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          missedRampage: this.missedRampage.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
