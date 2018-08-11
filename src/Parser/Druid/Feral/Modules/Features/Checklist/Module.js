import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';

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
import TigersFuryEnergy from '../../Spells/TigersFuryEnergy';

class Checklist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,

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

          // be prepared
          legendariesEquipped: {
            actual: this.legendaryCountChecker.equipped,
            max: this.legendaryCountChecker.max,
            isLessThan: this.legendaryCountChecker.max,
            style: 'number',
          },
          legendariesUpgraded: {
            actual: this.legendaryUpgradeChecker.upgradedLegendaries.length,
            max: this.legendaryCountChecker.max,
            isLessThan: this.legendaryCountChecker.max,
            style: 'number',
          },
          prePotion: this.prePotion.prePotionSuggestionThresholds,
          secondPotion: this.prePotion.prePotionSuggestionThresholds,
          itemsEnchanted: {
            actual: this.enchantChecker.numEnchantableGear - this.enchantChecker.numSlotsMissingEnchant,
            max: this.enchantChecker.numEnchantableGear,
            isLessThan: this.enchantChecker.numEnchantableGear,
            style: 'number',
          },
          itemsBestEnchanted: {
            // numSlotsMissingMaxEnchant doesn't include items without an enchant at all
            actual: this.enchantChecker.numEnchantableGear - this.enchantChecker.numSlotsMissingEnchant - this.enchantChecker.numSlotsMissingMaxEnchant,
            max: this.enchantChecker.numEnchantableGear,
            isLessThan: this.enchantChecker.numEnchantableGear,
            style: 'number',
          },
        }}
      />
    );
  }
}

export default Checklist;
