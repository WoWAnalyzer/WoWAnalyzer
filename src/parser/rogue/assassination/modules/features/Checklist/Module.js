import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist2/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist2/PreparationRuleAnalyzer';

import GarroteUptime from '../../spells/GarroteUptime';
import RuptureUptime from '../../spells/RuptureUptime';

import Blindside from '../../talents/Blindside';

import EnergyDetails from '../../../../shared/resources/EnergyDetails';
import EnergyCapTracker from '../../../../shared/resources/EnergyCapTracker';
import ComboPointDetails from '../../../../shared/resources/ComboPointDetails';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    garroteUptime: GarroteUptime,
    ruptureUptime: RuptureUptime,

    blindside: Blindside,

    energyDetails: EnergyDetails,
    energyCapTracker: EnergyCapTracker,
    comboPointDetails: ComboPointDetails,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          garroteUptime: this.garroteUptime.suggestionThresholds,
          ruptureUptime: this.ruptureUptime.suggestionThresholds,

          blindsideEfficiency: this.blindside.suggestionThresholds,

          energyEfficiency: this.energyDetails.suggestionThresholds,
          energyCapEfficiency: this.energyCapTracker.suggestionThresholds,
          comboPointEfficiency: this.comboPointDetails.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
