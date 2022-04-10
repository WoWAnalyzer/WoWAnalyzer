import PreparationRuleAnalyzer from 'parser/shadowlands/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import { ArcaneIntellect, CancelledCasts, RuneOfPower } from '@wowanalyzer/mage';

import AlwaysBeCasting from '../features/AlwaysBeCasting';
import { apl, check } from '../features/apl';
import BrainFreeze from '../features/BrainFreeze';
import IceLance from '../features/IceLance';
import IcyVeins from '../features/IcyVeins';
import MunchedProcs from '../features/MunchedProcs';
import WaterElemental from '../features/WaterElemental';
import WintersChill from '../features/WintersChill';
import GlacialSpike from '../talents/GlacialSpike';
import ThermalVoid from '../talents/ThermalVoid';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    icyVeins: IcyVeins,
    munchedProcs: MunchedProcs,
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
  };
  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected icyVeins!: IcyVeins;
  protected munchedProcs!: MunchedProcs;
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

  render() {
    const checkResults = check(this.owner.eventHistory, this.owner.info);
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        checkResults={checkResults}
        apl={apl}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          downtimeSuggestionThresholds: this.alwaysBeCasting.overrideDowntimeSuggestionThresholds,
          icyVeinsActiveTime: this.icyVeins.icyVeinsActiveTimeThresholds,
          munchedProcs: this.munchedProcs.munchedProcsThresholds,
          brainFreezeUtilization: this.brainFreeze.brainFreezeUtilizationThresholds,
          brainFreezeOverwrites: this.brainFreeze.brainFreezeOverwritenThresholds,
          brainFreezeExpired: this.brainFreeze.brainFreezeExpiredThresholds,
          brainFreezeUnbuffedFlurry: this.brainFreeze.flurryWithoutBrainFreezeThresholds,
          glacialSpikeUtilization: this.glacialSpike.glacialSpikeUtilizationThresholds,
          fingersOfFrostUtilization: this.iceLance.fingersProcUtilizationThresholds,
          iceLanceNotShattered: this.iceLance.nonShatteredIceLanceThresholds,
          wintersChillShatter: this.wintersChill.wintersChillShatterThresholds,
          wintersChillHardCasts: this.wintersChill.wintersChillHardCastThresholds,
          arcaneIntellectUptime: this.arcaneIntellect.suggestionThresholds,
          cancelledCasts: this.cancelledCasts.suggestionThresholds,
          runeOfPowerBuffUptime: this.runeOfPower.roundedSecondsSuggestionThresholds,
          waterElementalUptime: this.waterElemental.waterElementalUptimeThresholds,
        }}
      />
    );
  }
}

export default Checklist;
