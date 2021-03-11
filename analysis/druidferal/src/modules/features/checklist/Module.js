import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';
import React from 'react';

import RakeSnapshot from '../../bleeds/RakeSnapshot';
import RakeUptime from '../../bleeds/RakeUptime';
import RipSnapshot from '../../bleeds/RipSnapshot';
import RipUptime from '../../bleeds/RipUptime';
import ComboPointDetails from '../../combopoints/ComboPointDetails';
import FinisherUse from '../../combopoints/FinisherUse';
import Shadowmeld from '../../racials/Shadowmeld';
import FerociousBiteEnergy from '../../spells/FerociousBiteEnergy';
import SwipeHitCount from '../../spells/SwipeHitCount';
import TigersFuryEnergy from '../../spells/TigersFuryEnergy';
import Bloodtalons from '../../talents/Bloodtalons';
import MoonfireSnapshot from '../../talents/MoonfireSnapshot';
import MoonfireUptime from '../../talents/MoonfireUptime';
import Predator from '../../talents/Predator';
import SavageRoar from '../../talents/SavageRoar';
import EnergyCapTracker from '../EnergyCapTracker';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    rakeUptime: RakeUptime,
    moonfireUptime: MoonfireUptime,
    swipeHitCount: SwipeHitCount,
    comboPointDetails: ComboPointDetails,
    ripUptime: RipUptime,
    savageRoar: SavageRoar,
    ferociousBiteEnergy: FerociousBiteEnergy,
    energyCapTracker: EnergyCapTracker,
    ripSnapshot: RipSnapshot,
    rakeSnapshot: RakeSnapshot,
    moonfireSnapshot: MoonfireSnapshot,
    bloodtalons: Bloodtalons,
    predator: Predator,
    tigersFuryEnergy: TigersFuryEnergy,
    shadowmeld: Shadowmeld,
    finisherUse: FinisherUse,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          // be prepared
          ...this.preparationRuleAnalyzer.thresholds,

          // builders
          rakeUptime: this.rakeUptime.suggestionThresholds,
          moonfireUptime: this.moonfireUptime.suggestionThresholds,
          swipeHitOne: this.swipeHitCount.hitJustOneThresholds,
          comboPointsWaste: this.comboPointDetails.wastingSuggestionThresholds,

          // finishers
          ripUptime: this.ripUptime.suggestionThresholds,
          savageRoarUptime: this.savageRoar.suggestionThresholds,
          ferociousBiteEnergy: this.ferociousBiteEnergy.suggestionThresholds,
          ripShouldBeBite: this.ripSnapshot.shouldBeBiteSuggestionThresholds,
          ripDurationReduction: this.ripSnapshot.durationReductionThresholds,
          badLowComboFinishers: this.finisherUse.badFinishersThresholds,

          // energy
          energyCapped: this.energyCapTracker.suggestionThresholds,
          tigersFuryIgnoreEnergy: this.tigersFuryEnergy.shouldIgnoreEnergyWaste,
          tigersFuryEnergy: this.tigersFuryEnergy.suggestionThresholds,

          // cooldowns
          shadowmeld: this.shadowmeld.efficiencyThresholds,

          // snapshot
          rakeDowngrade: this.rakeSnapshot.downgradeSuggestionThresholds,
          rakeProwlDowngrade: this.rakeSnapshot.prowlLostSuggestionThresholds,
          ripDowngrade: this.ripSnapshot.downgradeSuggestionThresholds,
          moonfireDowngrade: this.moonfireSnapshot.downgradeSuggestionThresholds,

          // bloodtalons
          bloodtalonsWasted: this.bloodtalons.suggestionThresholds,

          // talent selection
          predatorWrongTalent: this.predator.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
