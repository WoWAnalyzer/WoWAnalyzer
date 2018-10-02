import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import CastEfficiency from 'parser/core/modules/CastEfficiency';
import Combatants from 'parser/core/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/core/modules/features/Checklist2/PreparationRuleAnalyzer';

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
import BrutalSlashHitCount from '../../talents/BrutalSlashHitCount';
import TigersFuryEnergy from '../../spells/TigersFuryEnergy';

class Checklist extends Analyzer {
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
    brutalSlashHitcount: BrutalSlashHitCount,
    tigersFuryEnergy: TigersFuryEnergy,
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
          finishersBelowFull: this.comboPointDetails.finishersBelowMaxSuggestionThresholds,
          
          // energy
          energyCapped: this.energyCapTracker.suggestionThresholds,
          tigersFuryIgnoreEnergy: this.tigersFuryEnergy.shouldIgnoreEnergyWaste,
          tigersFuryEnergy: this.tigersFuryEnergy.suggestionThresholds,

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
          brutalSlashWrongTalent: this.brutalSlashHitcount.wrongTalentThresholds,
        }}
      />
    );
  }
}

export default Checklist;
