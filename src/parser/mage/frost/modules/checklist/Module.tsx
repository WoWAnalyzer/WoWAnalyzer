import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

import BrainFreeze from '../features/BrainFreeze';
import BrainFreezeNoIL from '../features/BrainFreezeNoIL';
import GlacialSpike from '../features/GlacialSpike';
import GlacialSpikeNoIL from '../features/GlacialSpikeNoIL';
import IceLance from '../features/IceLance';
import IceLanceNoIL from '../features/IceLanceNoIL';
import ThermalVoid from '../features/ThermalVoid';
import WintersChill from '../features/WintersChill';
import WintersChillNoIL from '../features/WintersChillNoIL';
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import ArcaneIntellect from '../../../shared/modules/features/ArcaneIntellect';
import CancelledCasts from '../../../shared/modules/features/CancelledCasts';
import RuneOfPower from '../../../shared/modules/features/RuneOfPower';
import WaterElemental from '../features/WaterElemental';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    brainFreeze: BrainFreeze,
    glacialSpike: GlacialSpike,
    iceLance: IceLance,
    thermalVoid: ThermalVoid,
    wintersChill: WintersChill,
    arcaneIntellect: ArcaneIntellect,
    cancelledCasts: CancelledCasts,
    runeOfPower: RuneOfPower,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    waterElemental: WaterElemental,

    //NoIL Build
    brainFreezeNoIL: BrainFreezeNoIL,
    glacialSpikeNoIL: GlacialSpikeNoIL,
    iceLanceNoIL: IceLanceNoIL,
    wintersChillNoIL: WintersChillNoIL,

  };
  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected brainFreeze!: BrainFreeze;
  protected glacialSpike!: GlacialSpike;
  protected iceLance!: IceLance;
  protected thermalVoid!: ThermalVoid;
  protected wintersChill!: WintersChill;
  protected arcaneIntellect!: ArcaneIntellect;
  protected cancelledCasts!: CancelledCasts;
  protected runeOfPower!: RuneOfPower;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected waterElemental!: WaterElemental;

  //NoIL
  protected brainFreezeNoIL!: BrainFreezeNoIL;
  protected glacialSpikeNoIL!: GlacialSpikeNoIL;
  protected iceLanceNoIL!: IceLanceNoIL;
  protected wintersChillNoIL!: WintersChillNoIL;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        owner={this.owner}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          brainFreezeUtilization: this.brainFreeze.brainFreezeUtilizationThresholds,
          brainFreezeOverwrites: this.brainFreeze.brainFreezeOverwritenThresholds,
          brainFreezeExpired: this.brainFreeze.brainFreezeExpiredThresholds,
          brainFreezeUnbuffedFlurry: this.brainFreeze.flurryWithoutBrainFreezeThresholds,
          glacialSpikeUtilization: this.glacialSpike.glacialSpikeUtilizationThresholds,
          fingersOfFrostUtilization: this.iceLance.fingersProcUtilizationThresholds,
          iceLanceNotShattered: this.iceLance.nonShatteredIceLanceThresholds,
          wintersChillIceLance: this.wintersChill.wintersChillIceLanceThresholds,
          wintersChillHardCasts: this.wintersChill.wintersChillHardCastThresholds,
          arcaneIntellectUptime: this.arcaneIntellect.suggestionThresholds,
          cancelledCasts: this.cancelledCasts.suggestionThresholds,
          runeOfPowerBuffUptime: this.runeOfPower.roundedSecondsSuggestionThresholds,
          waterElementalUptime: this.waterElemental.waterElementalUptimeThresholds,

          //NoIL Build
          brainFreezeUtilizationNoIL: this.brainFreezeNoIL.brainFreezeUtilizationThresholds,
          brainFreezeOverwritesNoIL: this.brainFreezeNoIL.brainFreezeOverwritenThresholds,
          brainFreezeExpiredNoIL: this.brainFreezeNoIL.brainFreezeExpiredThresholds,
          brainFreezeUnbuffedFlurryNoIL: this.brainFreezeNoIL.flurryWithoutBrainFreezeThresholds,
          glacialSpikeUtilizationNoIL: this.glacialSpikeNoIL.glacialSpikeUtilizationThresholds,
          wintersChillHardCastsNoIL: this.wintersChillNoIL.wintersChillHardCastThresholds,
        }}
      />
    );
  }
}

export default Checklist;
