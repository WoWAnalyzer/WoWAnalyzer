import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';
import React from 'react';

import { ArcaneIntellect, CancelledCasts, RuneOfPower } from '@wowanalyzer/mage';

import AlwaysBeCasting from '../features/AlwaysBeCasting';
import CombustionActiveTime from '../features/CombustionActiveTime';
import CombustionCharges from '../features/CombustionCharges';
import CombustionFirestarter from '../features/CombustionFirestarter';
import CombustionPreCastDelay from '../features/CombustionPreCastDelay';
import CombustionSpellUsage from '../features/CombustionSpellUsage';
import HeatingUp from '../features/HeatingUp';
import HotStreak from '../features/HotStreak';
import HotStreakPreCasts from '../features/HotStreakPreCasts';
import HotStreakWastedCrits from '../features/HotStreakWastedCrits';
import Pyroclasm from '../features/Pyroclasm';
import ShiftingPowerUsage from '../features/ShiftingPowerUsage';
import InfernalCascade from '../items/InfernalCascade';
import Meteor from '../talents/Meteor';
import MeteorCombustion from '../talents/MeteorCombustion';
import MeteorRune from '../talents/MeteorRune';
import SearingTouch from '../talents/SearingTouch';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    combustionCharges: CombustionCharges,
    combustionFirestarter: CombustionFirestarter,
    combustionSpellUsage: CombustionSpellUsage,
    combustionActiveTime: CombustionActiveTime,
    combustionPreCastDelay: CombustionPreCastDelay,
    heatingUp: HeatingUp,
    hotStreak: HotStreak,
    hotStreakWastedCrits: HotStreakWastedCrits,
    hotStreakPreCasts: HotStreakPreCasts,
    pyroclasm: Pyroclasm,
    searingTouch: SearingTouch,
    meteor: Meteor,
    meteorRune: MeteorRune,
    meteorCombustion: MeteorCombustion,
    infernalCascade: InfernalCascade,
    shiftingPowerUsage: ShiftingPowerUsage,
    castEfficiency: CastEfficiency,
    arcaneIntellect: ArcaneIntellect,
    cancelledCasts: CancelledCasts,
    runeOfPower: RuneOfPower,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
  };
  protected combatants!: Combatants;
  protected combustionCharges!: CombustionCharges;
  protected combustionFirestarter!: CombustionFirestarter;
  protected combustionSpellUsage!: CombustionSpellUsage;
  protected combustionActiveTime!: CombustionActiveTime;
  protected combustionPreCastDelay!: CombustionPreCastDelay;
  protected heatingUp!: HeatingUp;
  protected hotStreak!: HotStreak;
  protected hotStreakWastedCrits!: HotStreakWastedCrits;
  protected hotStreakPreCasts!: HotStreakPreCasts;
  protected pyroclasm!: Pyroclasm;
  protected searingTouch!: SearingTouch;
  protected meteor!: Meteor;
  protected meteorRune!: MeteorRune;
  protected meteorCombustion!: MeteorCombustion;
  protected infernalCascade!: InfernalCascade;
  protected shiftingPowerUsage!: ShiftingPowerUsage;
  protected castEfficiency!: CastEfficiency;
  protected arcaneIntellect!: ArcaneIntellect;
  protected cancelledCasts!: CancelledCasts;
  protected runeOfPower!: RuneOfPower;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          downtimeSuggestionThresholds: this.alwaysBeCasting.suggestionThresholds,
          phoenixFlamesCombustionCharges: this.combustionCharges.phoenixFlamesThresholds,
          fireBlastCombustionCharges: this.combustionCharges.fireBlastThresholds,
          firestarterCombustionUsage: this.combustionFirestarter.SuggestionThresholds,
          scorchSpellUsageDuringCombustion: this.combustionSpellUsage
            .scorchDuringCombustionThresholds,
          fireballSpellUsageDuringCombustion: this.combustionSpellUsage
            .fireballDuringCombustionThresholds,
          combustionActiveTime: this.combustionActiveTime.combustionActiveTimeThresholds,
          combustionPreCastDelay: this.combustionPreCastDelay.combustionCastDelayThresholds,
          fireBlastHeatingUpUsage: this.heatingUp.fireBlastUtilSuggestionThresholds,
          phoenixFlamesHeatingUpUsage: this.heatingUp.phoenixFlamesUtilSuggestionThresholds,
          hotStreakUtilization: this.hotStreak.hotStreakUtilizationThresholds,
          hotStreakWastedCrits: this.hotStreakWastedCrits.wastedCritsThresholds,
          hotStreakPreCasts: this.hotStreakPreCasts.castBeforeHotStreakThresholds,
          pyroclasmUtilization: this.pyroclasm.procUtilizationThresholds,
          searingTouchUtilization: this.searingTouch.executeSuggestionThreshold,
          meteorEfficiency: this.meteor.meteorEfficiencySuggestionThresholds,
          meteorUtilization: this.meteorRune.meteorUtilSuggestionThresholds,
          infernalCascadeMaxStacks: this.infernalCascade.maxStackUptimeThresholds,
          shiftingPowerUsage: this.shiftingPowerUsage.shiftingPowerUsageThresholds,
          meteorCombustionUtilization: this.meteorCombustion.meteorCombustionSuggestionThresholds,
          arcaneIntellectUptime: this.arcaneIntellect.suggestionThresholds,
          cancelledCasts: this.cancelledCasts.suggestionThresholds,
          runeOfPowerBuffUptime: this.runeOfPower.roundedSecondsSuggestionThresholds,
          runeOfPowerOverlaps: this.runeOfPower.overlappedRunesThresholds,
        }}
      />
    );
  }
}

export default Checklist;
