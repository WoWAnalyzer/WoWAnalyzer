import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import CastEfficiency from 'parser/core/modules/CastEfficiency';
import Combatants from 'parser/core/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/core/modules/features/Checklist2/PreparationRuleAnalyzer';

import BoneChilling from '../features/BoneChilling';
import BrainFreeze from '../features/BrainFreeze';
import GlacialSpike from '../features/GlacialSpike';
import IceLance from '../features/IceLance';
import ThermalVoid from '../features/ThermalVoid';
import WintersChill from '../features/WintersChill';
import WintersReach from '../traits/WintersReach';
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import ArcaneIntellect from '../../../shared/modules/features/ArcaneIntellect';
import CancelledCasts from '../../../shared/modules/features/CancelledCasts';
import RuneOfPower from '../../../shared/modules/features/RuneOfPower';

import Component from './Component';

class Checklist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    boneChilling: BoneChilling,
    brainFreeze: BrainFreeze,
    glacialSpike: GlacialSpike,
    iceLance: IceLance,
    thermalVoid: ThermalVoid,
    wintersChill: WintersChill,
    wintersReach: WintersReach,
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
          boneChillingUptime: this.boneChilling.suggestionThresholds,
          brainFreezeUtilization: this.brainFreeze.utilSuggestionThresholds,
          brainFreezeOverwrites: this.brainFreeze.overwriteSuggestionThresholds,
          brainFreezeExpired: this.brainFreeze.expiredSuggestionThresholds,
          brainFreezeUnbuffedFlurry: this.brainFreeze.flurryWithoutProcSuggestionThresholds,
          glacialSpikeUtilization: this.glacialSpike.utilSuggestionThresholds,
          fingersOfFrostUtilization: this.iceLance.fingersUtilSuggestionThresholds,
          iceLanceNotShattered: this.iceLance.nonShatteredSuggestionThresholds,
          thermalVoidDuration: this.thermalVoid.suggestionThresholds,
          wintersChillIceLance: this.wintersChill.iceLanceUtilSuggestionThresholds,
          wintersChillHardCasts: this.wintersChill.hardcastUtilSuggestionThresholds,
          wintersReachUtilization: this.wintersReach.procUtilizationThresholds,
          arcaneIntellectUptime: this.arcaneIntellect.suggestionThresholds,
          cancelledCasts: this.cancelledCasts.suggestionThresholds,
          runeOfPowerBuffUptime: this.runeOfPower.roundedSecondsSuggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
