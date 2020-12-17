import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

import EnergyDetails from '../../../../shared/resources/EnergyDetails';
import OutlawEnergyCapTracker from '../../core/OutlawEnergyCapTracker';
import ComboPointDetails from '../../../../shared/resources/ComboPointDetails';

import Finishers from '../Finishers';
import RollTheBonesBuffs from '../../spells/RollTheBonesBuffs';
import RollTheBonesEfficiency from '../../spells/RollTheBonesEfficiency';
import Dispatch from '../../spells/Dispatch';
import Opportunity from '../../spells/Opportunity';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    energyDetails: EnergyDetails,
    energyCapTracker: OutlawEnergyCapTracker,
    comboPointDetails: ComboPointDetails,

    finishers: Finishers,
    rollTheBonesBuffs: RollTheBonesBuffs,
    rollTheBonesEfficiency: RollTheBonesEfficiency,
    dispatch: Dispatch,
    opportunity: Opportunity,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          energyEfficiency: this.energyDetails.suggestionThresholds,
          energyCapEfficiency: this.energyCapTracker.suggestionThresholds,
          comboPointEfficiency: this.comboPointDetails.suggestionThresholds,

          finishers: this.finishers.suggestionThresholds,
          rollTheBonesBuffs: this.rollTheBonesBuffs.suggestionThresholds,
          rollTheBonesEfficiency: this.rollTheBonesEfficiency.rollSuggestions,
          dispatch: this.dispatch.thresholds,
          opportunity: this.opportunity.thresholds,
        }}
      />
    );
  }
}

export default Checklist;
