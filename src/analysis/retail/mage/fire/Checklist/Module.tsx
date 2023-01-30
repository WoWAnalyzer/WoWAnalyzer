import {
  ArcaneIntellect,
  CancelledCasts,
  RuneOfPower,
  Meteor,
  MeteorRune,
} from 'analysis/retail/mage/shared';
import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import AlwaysBeCasting from '../core/AlwaysBeCasting';
import CombustionActiveTime from '../core/CombustionActiveTime';
import Combustion from '../core/Combustion';
import HeatingUp from '../core/HeatingUp';
import HotStreak from '../core/HotStreak';
import Pyroclasm from '../talents/Pyroclasm';
import ShiftingPowerUsage from '../talents/ShiftingPowerUsage';
import FeelTheBurn from '../talents/FeelTheBurn';
import MeteorCombustion from '../talents/MeteorCombustion';
import SearingTouch from '../talents/SearingTouch';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    combustion: Combustion,
    combustionActiveTime: CombustionActiveTime,
    heatingUp: HeatingUp,
    hotStreak: HotStreak,
    pyroclasm: Pyroclasm,
    searingTouch: SearingTouch,
    meteor: Meteor,
    meteorRune: MeteorRune,
    meteorCombustion: MeteorCombustion,
    feelTheBurn: FeelTheBurn,
    shiftingPowerUsage: ShiftingPowerUsage,
    castEfficiency: CastEfficiency,
    arcaneIntellect: ArcaneIntellect,
    cancelledCasts: CancelledCasts,
    runeOfPower: RuneOfPower,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
  };
  protected combatants!: Combatants;
  protected combustion!: Combustion;
  protected combustionActiveTime!: CombustionActiveTime;
  protected heatingUp!: HeatingUp;
  protected hotStreak!: HotStreak;
  protected pyroclasm!: Pyroclasm;
  protected searingTouch!: SearingTouch;
  protected meteor!: Meteor;
  protected meteorRune!: MeteorRune;
  protected meteorCombustion!: MeteorCombustion;
  protected feelTheBurn!: FeelTheBurn;
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
          phoenixFlamesCombustionCharges: this.combustion.phoenixFlamesThresholds,
          fireBlastCombustionCharges: this.combustion.fireBlastThresholds,
          fireballSpellUsageDuringCombustion: this.combustion.fireballDuringCombustionThresholds,
          combustionActiveTime: this.combustionActiveTime.combustionActiveTimeThresholds,
          combustionPreCastDelay: this.combustion.combustionCastDelayThresholds,
          fireBlastHeatingUpUsage: this.heatingUp.fireBlastUtilSuggestionThresholds,
          phoenixFlamesHeatingUpUsage: this.heatingUp.phoenixFlamesUtilSuggestionThresholds,
          hotStreakUtilization: this.hotStreak.hotStreakUtilizationThresholds,
          hotStreakWastedCrits: this.hotStreak.wastedCritsThresholds,
          hotStreakPreCasts: this.hotStreak.castBeforeHotStreakThresholds,
          pyroclasmUtilization: this.pyroclasm.procUtilizationThresholds,
          searingTouchUtilization: this.searingTouch.executeSuggestionThreshold,
          meteorEfficiency: this.meteor.meteorEfficiencySuggestionThresholds,
          meteorUtilization: this.meteorRune.meteorUtilSuggestionThresholds,
          feelTheBurnMaxStacks: this.feelTheBurn.maxStackUptimeThresholds,
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
