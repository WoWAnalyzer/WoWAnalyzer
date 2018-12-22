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

import Subterfuge from '../../talents/Subterfuge';

import Component from './Component';
import GarroteSnapshot from '../GarroteSnapshot';
import RuptureSnapshot from '../RuptureSnapshot';
import Nightstalker from '../../talents/Nightstalker';
import MasterAssassin from '../../talents/MasterAssassin';

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

    subterfuge: Subterfuge,
    nightstalker: Nightstalker,
    masterAssassin: MasterAssassin,
    garroteSnapshot: GarroteSnapshot,
    ruptureSnapshot: RuptureSnapshot,
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

          subterfugeEfficiency: this.subterfuge.suggestionThresholds,
          nightstalkerEfficiency: this.nightstalker.suggestionThresholds,
          nightstalkerOpenerEfficiency: this.nightstalker.suggestionThresholdsOpener,
          masterAssassinEfficiency: this.masterAssassin.suggestionThresholds,
          ruptureSnapshotEfficiency: this.ruptureSnapshot.suggestionThresholds,
          garroteSnapshotEfficiency: this.garroteSnapshot.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
