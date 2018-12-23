import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist2/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist2/PreparationRuleAnalyzer';

import Component from './Component';
import RakeUptime from '../../bleeds/RakeUptime';
import MoonfireUptime from '../../talents/MoonfireUptime';
import SwipeHitCount from '../../spells/SwipeHitCount';
import ComboPointDetails from '../../combopoints/ComboPointDetails';
import RipUptime from '../../bleeds/RipUptime';
import SavageRoarUptime from '../../talents/SavageRoarUptime';
import FerociousBiteEnergy from '../../spells/FerociousBiteEnergy';
import EnergyCapTracker from '../EnergyCapTracker';
import RipSnapshot from '../../bleeds/RipSnapshot';
import RakeSnapshot from '../../bleeds/RakeSnapshot';
import MoonfireSnapshot from '../../talents/MoonfireSnapshot';
import PredatorySwiftness from '../../spells/PredatorySwiftness';
import Bloodtalons from '../../talents/Bloodtalons';
import Predator from '../../talents/Predator';
import TigersFuryEnergy from '../../spells/TigersFuryEnergy';
import Shadowmeld from '../../racials/Shadowmeld';

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
    savageRoarUptime: SavageRoarUptime,
    ferociousBiteEnergy: FerociousBiteEnergy,
    energyCapTracker: EnergyCapTracker,
    ripSnapshot: RipSnapshot,
    rakeSnapshot: RakeSnapshot,
    moonfireSnapshot: MoonfireSnapshot,
    predatorySwiftness: PredatorySwiftness,
    bloodtalons: Bloodtalons,
    predator: Predator,
    tigersFuryEnergy: TigersFuryEnergy,
    shadowmeld: Shadowmeld,
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
          savageRoarUptime: this.savageRoarUptime.suggestionThresholds,
          ferociousBiteEnergy: this.ferociousBiteEnergy.suggestionThresholds,
          ripShouldBeBite: this.ripSnapshot.shouldBeBiteSuggestionThresholds,
          ripDurationReduction: this.ripSnapshot.durationReductionThresholds,
          finishersBelowFull: this.comboPointDetails.finishersBelowMaxSuggestionThresholds,
          
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
          predatorySwiftnessWasted: this.predatorySwiftness.suggestionThresholds,
          bloodtalonsWasted: this.bloodtalons.suggestionThresholds,

          // talent selection
          predatorWrongTalent: this.predator.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
