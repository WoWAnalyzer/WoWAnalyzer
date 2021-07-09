import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';
import React from 'react';

import RakeUptimeAndSnapshots from '../../bleeds/RakeUptimeAndSnapshots';
import RipUptimeAndSnapshots from '../../bleeds/RipUptimeAndSnapshots';
import ComboPointDetails from '../../combopoints/ComboPointDetails';
import FinisherUse from '../../combopoints/FinisherUse';
import Shadowmeld from '../../racials/Shadowmeld';
import AdaptiveSwarmFeral from '../../shadowlands/AdaptiveSwarmFeral';
import FerociousBite from '../../spells/FerociousBite';
import SwipeHitCount from '../../spells/SwipeHitCount';
import TigersFuryEnergy from '../../spells/TigersFuryEnergy';
import Bloodtalons from '../../talents/Bloodtalons';
import Bloodtalons2 from '../../talents/Bloodtalons2';
import MoonfireUptimeAndSnapshots from '../../talents/MoonfireUptimeAndSnapshots';
import Predator from '../../talents/Predator';
import SavageRoar from '../../talents/SavageRoar';
import EnergyCapTracker from '../EnergyCapTracker';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    rakeUptime: RakeUptimeAndSnapshots,
    moonfireUptime: MoonfireUptimeAndSnapshots,
    adaptiveSwarm: AdaptiveSwarmFeral,
    swipeHitCount: SwipeHitCount,
    comboPointDetails: ComboPointDetails,
    ripUptime: RipUptimeAndSnapshots,
    savageRoar: SavageRoar,
    ferociousBite: FerociousBite,
    energyCapTracker: EnergyCapTracker,
    bloodtalons: Bloodtalons,
    bloodtalons2: Bloodtalons2,
    predator: Predator,
    tigersFuryEnergy: TigersFuryEnergy,
    shadowmeld: Shadowmeld,
    finisherUse: FinisherUse,
  };

  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;

  protected rakeUptime!: RakeUptimeAndSnapshots;
  protected moonfireUptime!: MoonfireUptimeAndSnapshots;
  protected adaptiveSwarm!: AdaptiveSwarmFeral;
  protected swipeHitCount!: SwipeHitCount;
  protected comboPointDetails!: ComboPointDetails;
  protected ripUptime!: RipUptimeAndSnapshots;
  protected savageRoar!: SavageRoar;
  protected ferociousBite!: FerociousBite;
  protected energyCapTracker!: EnergyCapTracker;
  protected bloodtalons!: Bloodtalons;
  protected bloodtalons2!: Bloodtalons2;
  protected predator!: Predator;
  protected tigersFuryEnergy!: TigersFuryEnergy;
  protected shadowmeld!: Shadowmeld;
  protected finisherUse!: FinisherUse;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          // be prepared
          ...this.preparationRuleAnalyzer.thresholds,

          // uptimes
          ripUptime: this.ripUptime.suggestionThresholds,
          rakeUptime: this.rakeUptime.suggestionThresholds,
          moonfireUptime: this.moonfireUptime.suggestionThresholds,
          adaptiveSwarmUptime: this.adaptiveSwarm.suggestionThresholds,

          // snapshots
          ripTfSnapshot: this.ripUptime.tigersFurySnapshotThresholds,
          ripBtSnapshot: this.ripUptime.bloodTalonsSnapshotThresholds,
          rakeTfSnapshot: this.rakeUptime.tigersFurySnapshotThresholds,
          moonfireTfSnapshot: this.moonfireUptime.tigersFurySnapshotThresholds,
          prowlRakeLost: this.rakeUptime.prowlLostThresholds,

          // finishers
          ferociousBiteEnergy: this.ferociousBite.extraEnergySuggestionThresholds,
          badLowComboFinishers: this.finisherUse.badFinishersThresholds,
          ripDurationReduction: this.ripUptime.earlyRefreshThresholds,
          ferociousBiteBloodtalons: this.bloodtalons2.correctFbSuggestionThresholds,
          savageRoarUptime: this.savageRoar.suggestionThresholds,
          // (Apex bite usage ??? or just a suggestion?)

          // spend your resources
          energyCapped: this.energyCapTracker.suggestionThresholds,
          tigersFuryEnergy: this.tigersFuryEnergy.suggestionThresholds,
          comboPointsWaste: this.comboPointDetails.wastingSuggestionThresholds,

          // TODO combo builders section ??

          swipeHitOne: this.swipeHitCount.hitJustOneThresholds,

          // cooldowns
          shadowmeld: this.shadowmeld.efficiencyThresholds,
        }}
      />
    );
  }
}

export default Checklist;
