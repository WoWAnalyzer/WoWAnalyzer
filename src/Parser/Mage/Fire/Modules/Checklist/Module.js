import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import PreparationRuleAnalyzer from 'Parser/Core/Modules/Features/Checklist2/PreparationRuleAnalyzer';

import CombustionCharges from '../Features/CombustionCharges';
import CombustionFirestarter from '../Features/CombustionFirestarter';
import CombustionPyroclasm from '../Features/CombustionPyroclasm';
import CombustionSpellUsage from '../Features/CombustionSpellUsage';
import HeatingUp from '../Features/HeatingUp';
import HotStreak from '../Features/HotStreak';
import Pyroclasm from '../Features/Pyroclasm';
import SearingTouch from '../Features/SearingTouch';
import AlwaysBeCasting from '../Features/AlwaysBeCasting';
import ArcaneIntellect from '../../../Shared/Modules/Features/ArcaneIntellect';
import CancelledCasts from '../../../Shared/Modules/Features/CancelledCasts';
import RuneOfPower from '../../../Shared/Modules/Features/RuneOfPower';

import Component from './Component';

class Checklist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    combustionCharges: CombustionCharges,
    combustionFirestarter: CombustionFirestarter,
    combustionPyroclasm: CombustionPyroclasm,
    combustionSpellUsage: CombustionSpellUsage,
    heatingUp: HeatingUp,
    hotStreak: HotStreak,
    pyroclasm: Pyroclasm,
    searingTouch: SearingTouch,
    castEfficiency: CastEfficiency,
    arcaneIntellect: ArcaneIntellect,
    cancelledCasts: CancelledCasts,
    runeOfPower: RuneOfPower,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          phoenixFlamesCombustionCharges: this.combustionCharges.phoenixFlamesThresholds,
          fireBlastCombustionCharges: this.combustionCharges.fireBlastThresholds,
          firestarterCombustionUsage: this.combustionFirestarter.SuggestionThresholds,
          pyroclasmCombustionUsage: this.combustionPyroclasm.pyrloclasmUtilThresholds,
          combustionSpellUsage: this.combustionSpellUsage.suggestionThresholds,
          fireBlastHeatingUpUsage: this.heatingUp.fireBlastUtilSuggestionThresholds,
          phoenixFlamesHeatingUpUsage: this.heatingUp.phoenixFlamesUtilSuggestionThresholds,
          hotStreakUtilization: this.hotStreak.hotStreakUtilizationThresholds,
          hotStreakWastedCrits: this.hotStreak.wastedCritsThresholds,
          hotStreakPreCasts: this.hotStreak.castBeforeHotStreakThresholds,
          pyroclasmUtilization: this.pyroclasm.procUtilizationThresholds,
          searingTouchUtilization: this.searingTouch.suggestionThreshold,
          arcaneIntellectUptime: this.arcaneIntellect.suggestionThresholds,
          cancelledCasts: this.cancelledCasts.suggestionThresholds,
          runeOfPowerBuffUptime: this.runeOfPower.roundedSecondsSuggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;