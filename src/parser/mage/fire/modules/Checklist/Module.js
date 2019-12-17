import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

import Combustion from '../features/Combustion';
import HeatingUp from '../features/HeatingUp';
import HotStreak from '../features/HotStreak';
import HotStreakWastedCrits from '../features/HotStreakWastedCrits';
import HotStreakPreCasts from '../features/HotStreakPreCasts';
import Pyroclasm from '../features/Pyroclasm';
import SearingTouch from '../features/SearingTouch';
import Meteor from '../features/Meteor';
import MeteorRune from '../features/MeteorRune';
import MeteorCombustion from '../features/MeteorCombustion';
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import ArcaneIntellect from '../../../shared/modules/features/ArcaneIntellect';
import CancelledCasts from '../../../shared/modules/features/CancelledCasts';
import RuneOfPower from '../../../shared/modules/features/RuneOfPower';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    combustion: Combustion,
    heatingUp: HeatingUp,
    hotStreak: HotStreak,
    hotStreakWastedCrits: HotStreakWastedCrits,
    hotStreakPreCasts: HotStreakPreCasts,
    pyroclasm: Pyroclasm,
    searingTouch: SearingTouch,
    meteor: Meteor,
    meteorRune: MeteorRune,
    meteorCombustion: MeteorCombustion,
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
          phoenixFlamesCombustionCharges: this.combustion.phoenixFlamesThresholds,
          fireBlastCombustionCharges: this.combustion.fireBlastThresholds,
          firestarterCombustionUsage: this.combustion.firestarterSuggestionThresholds,
          scorchSpellUsageDuringCombustion: this.combustion.scorchDuringCombustionThresholds,
          fireballSpellUsageDuringCombustion: this.combustion.fireballDuringCombustionThresholds,
          fireBlastHeatingUpUsage: this.heatingUp.fireBlastUtilSuggestionThresholds,
          phoenixFlamesHeatingUpUsage: this.heatingUp.phoenixFlamesUtilSuggestionThresholds,
          hotStreakUtilization: this.hotStreak.hotStreakUtilizationThresholds,
          hotStreakWastedCrits: this.hotStreakWastedCrits.wastedCritsThresholds,
          hotStreakPreCasts: this.hotStreakPreCasts.castBeforeHotStreakThresholds,
          pyroclasmUtilization: this.pyroclasm.procUtilizationThresholds,
          searingTouchUtilization: this.searingTouch.suggestionThreshold,
          meteorEfficiency: this.meteor.meteorEfficiencySuggestionThresholds,
          meteorUtilization: this.meteorRune.meteorUtilSuggestionThresholds,
          meteorCombustionUtilization: this.meteorCombustion.meteorCombustionSuggestionThresholds,
          arcaneIntellectUptime: this.arcaneIntellect.suggestionThresholds,
          cancelledCasts: this.cancelledCasts.suggestionThresholds,
          runeOfPowerBuffUptime: this.runeOfPower.roundedSecondsSuggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
