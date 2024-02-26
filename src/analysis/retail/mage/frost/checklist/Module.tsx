import { ArcaneIntellect, CancelledCasts } from 'analysis/retail/mage/shared';
import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import AlwaysBeCasting from '../core/AlwaysBeCasting';
import BrainFreeze from '../core/BrainFreeze';
import IceLance from '../core/IceLance';
import IcyVeins from '../core/IcyVeins';
import FingersOfFrost from '../core/FingersOfFrost';
import WaterElemental from '../talents/WaterElemental';
import WintersChill from '../core/WintersChill';
import ThermalVoid from '../talents/ThermalVoid';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    icyVeins: IcyVeins,
    fingersOfFrost: FingersOfFrost,
    brainFreeze: BrainFreeze,
    iceLance: IceLance,
    thermalVoid: ThermalVoid,
    wintersChill: WintersChill,
    arcaneIntellect: ArcaneIntellect,
    cancelledCasts: CancelledCasts,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    waterElemental: WaterElemental,
  };
  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected icyVeins!: IcyVeins;
  protected fingersOfFrost!: FingersOfFrost;
  protected brainFreeze!: BrainFreeze;
  protected iceLance!: IceLance;
  protected thermalVoid!: ThermalVoid;
  protected wintersChill!: WintersChill;
  protected arcaneIntellect!: ArcaneIntellect;
  protected cancelledCasts!: CancelledCasts;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected waterElemental!: WaterElemental;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          downtimeSuggestionThresholds: this.alwaysBeCasting.overrideDowntimeSuggestionThresholds,
          icyVeinsActiveTime: this.icyVeins.icyVeinsActiveTimeThresholds,
          munchedProcs: this.fingersOfFrost.munchedProcsThresholds,
          brainFreezeUtilization: this.brainFreeze.brainFreezeUtilizationThresholds,
          brainFreezeOverwrites: this.brainFreeze.brainFreezeOverwrittenThresholds,
          brainFreezeExpired: this.brainFreeze.brainFreezeExpiredThresholds,
          fingersOfFrostUtilization: this.fingersOfFrost.fingersProcUtilizationThresholds,
          iceLanceNotShattered: this.iceLance.nonShatteredIceLanceThresholds,
          wintersChillShatter: this.wintersChill.wintersChillShatterThresholds,
          wintersChillHardCasts: this.wintersChill.wintersChillPreCastThresholds,
          arcaneIntellectUptime: this.arcaneIntellect.suggestionThresholds,
          cancelledCasts: this.cancelledCasts.suggestionThresholds,
          waterElementalUptime: this.waterElemental.waterElementalUptimeThresholds,
        }}
      />
    );
  }
}

export default Checklist;
