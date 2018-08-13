import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import PreparationRuleAnalyzer from 'Parser/Core/Modules/Features/Checklist2/PreparationRuleAnalyzer';

import Component from './Component';
import RakeUptime from '../../Bleeds/RakeUptime';
import MoonfireUptime from '../../Talents/MoonfireUptime';
import SwipeHitCount from '../../Spells/SwipeHitCount';
import ComboPointDetails from '../../ComboPoints/ComboPointDetails';
import RipUptime from '../../Bleeds/RipUptime';
import SavageRoarUptime from '../../Talents/SavageRoarUptime';
import FerociousBiteEnergy from '../../Spells/FerociousBiteEnergy';
import EnergyCapTracker from '../EnergyCapTracker';
import RipSnapshot from '../../Bleeds/RipSnapshot';
import RakeSnapshot from '../../Bleeds/RakeSnapshot';
import MoonfireSnapshot from '../../Talents/MoonfireSnapshot';
import PredatorySwiftness from '../../Spells/PredatorySwiftness';
import Bloodtalons from '../../Talents/Bloodtalons';
import Predator from '../../Talents/Predator';
import BrutalSlashHitCount from '../../Talents/BrutalSlashHitCount';

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
