import { ArcaneIntellect, CancelledCasts } from 'analysis/retail/mage/shared';
import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import AlwaysBeCasting from '../core/AlwaysBeCasting';
import CombustionActiveTime from '../core/CombustionActiveTime';
import Combustion from '../core/Combustion';
import HeatingUp from '../core/HeatingUp';
import HotStreak from '../core/HotStreak';
import ShiftingPowerUsage from '../talents/ShiftingPowerUsage';
import FeelTheBurn from '../talents/FeelTheBurn';
import Meteor from '../talents/Meteor';
import MeteorCombustion from '../talents/MeteorCombustion';
import SearingTouch from '../talents/SearingTouch';
import Component from './Component';
import ImprovedScorch from '../talents/ImprovedScorch';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    combustion: Combustion,
    combustionActiveTime: CombustionActiveTime,
    heatingUp: HeatingUp,
    hotStreak: HotStreak,
    searingTouch: SearingTouch,
    meteor: Meteor,
    meteorCombustion: MeteorCombustion,
    improvedScorch: ImprovedScorch,
    feelTheBurn: FeelTheBurn,
    shiftingPowerUsage: ShiftingPowerUsage,
    castEfficiency: CastEfficiency,
    arcaneIntellect: ArcaneIntellect,
    cancelledCasts: CancelledCasts,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
  };
  protected combatants!: Combatants;
  protected combustion!: Combustion;
  protected combustionActiveTime!: CombustionActiveTime;
  protected heatingUp!: HeatingUp;
  protected hotStreak!: HotStreak;
  protected searingTouch!: SearingTouch;
  protected meteor!: Meteor;
  protected meteorCombustion!: MeteorCombustion;
  protected improvedScorch!: ImprovedScorch;
  protected feelTheBurn!: FeelTheBurn;
  protected shiftingPowerUsage!: ShiftingPowerUsage;
  protected castEfficiency!: CastEfficiency;
  protected arcaneIntellect!: ArcaneIntellect;
  protected cancelledCasts!: CancelledCasts;
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
          //fireBlastCombustionCharges: this.combustion.fireBlastThresholds,
          fireballSpellUsageDuringCombustion: this.combustion.fireballDuringCombustionThresholds,
          combustionActiveTime: this.combustionActiveTime.combustionActiveTimeThresholds,
          combustionPreCastDelay: this.combustion.combustionCastDelayThresholds,
          fireBlastHeatingUpUsage: this.heatingUp.fireBlastUtilSuggestionThresholds,
          phoenixFlamesHeatingUpUsage: this.heatingUp.phoenixFlamesUtilSuggestionThresholds,
          hotStreakUtilization: this.hotStreak.hotStreakUtilizationThresholds,
          hotStreakWastedCrits: this.hotStreak.wastedCritsThresholds,
          hotStreakPreCasts: this.hotStreak.castBeforeHotStreakThresholds,
          searingTouchUtilization: this.searingTouch.executeSuggestionThreshold,
          meteorEfficiency: this.meteor.meteorEfficiencySuggestionThresholds,
          improvedScorchUptime: this.improvedScorch.uptimePercentThresholds,
          feelTheBurnMaxStacks: this.feelTheBurn.maxStackUptimeThresholds,
          shiftingPowerUsage: this.shiftingPowerUsage.shiftingPowerUsageThresholds,
          meteorCombustionUtilization: this.meteorCombustion.meteorCombustionSuggestionThresholds,
          arcaneIntellectUptime: this.arcaneIntellect.suggestionThresholds,
          cancelledCasts: this.cancelledCasts.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
