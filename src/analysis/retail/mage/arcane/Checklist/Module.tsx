import {
  ArcaneIntellect,
  CancelledCasts,
  MirrorImage,
  TimeAnomaly,
} from 'analysis/retail/mage/shared';
import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import AlwaysBeCasting from '../core/AlwaysBeCasting';
import ArcaneMissiles from '../core/ArcaneMissiles';
import ArcaneSurgeActiveTime from '../core/ArcaneSurgeActiveTime';
import ArcaneSurgeMana from '../core/ArcaneSurgeMana';
import ArcaneSurgePreReqs from '../core/ArcaneSurgePreReqs';
import RadiantSpark from '../talents/RadiantSpark';
import ManaValues from '../ManaChart/ManaValues';
import ArcaneEcho from '../talents/ArcaneEcho';
import ArcaneFamiliar from '../talents/ArcaneFamiliar';
import ArcaneOrb from '../talents/ArcaneOrb';
import RuleOfThrees from '../talents/RuleOfThrees';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    arcaneFamiliar: ArcaneFamiliar,
    arcaneOrb: ArcaneOrb,
    arcaneEcho: ArcaneEcho,
    arcaneSurgePreReqs: ArcaneSurgePreReqs,
    arcaneSurgeMana: ArcaneSurgeMana,
    arcaneSurgeActiveTime: ArcaneSurgeActiveTime,
    radiantSpark: RadiantSpark,
    ruleOfThrees: RuleOfThrees,
    timeAnomaly: TimeAnomaly,
    arcaneMissiles: ArcaneMissiles,
    manaValues: ManaValues,
    arcaneIntellect: ArcaneIntellect,
    cancelledCasts: CancelledCasts,
    mirrorImage: MirrorImage,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
  };
  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected arcaneFamiliar!: ArcaneFamiliar;
  protected arcaneOrb!: ArcaneOrb;
  protected arcaneEcho!: ArcaneEcho;
  protected arcaneSurgePreReqs!: ArcaneSurgePreReqs;
  protected arcaneSurgeMana!: ArcaneSurgeMana;
  protected arcaneSurgeActiveTime!: ArcaneSurgeActiveTime;
  protected radiantSpark!: RadiantSpark;
  protected ruleOfThrees!: RuleOfThrees;
  protected timeAnomaly!: TimeAnomaly;
  protected arcaneMissiles!: ArcaneMissiles;
  protected manaValues!: ManaValues;
  protected arcaneIntellect!: ArcaneIntellect;
  protected cancelledCasts!: CancelledCasts;
  protected mirrorImage!: MirrorImage;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          arcaneFamiliarUptime: this.arcaneFamiliar.arcaneFamiliarUptimeThresholds,
          arcaneOrbMissedOrbs: this.arcaneOrb.missedOrbsThresholds,
          arcaneEchoLowUsage: this.arcaneEcho.badTouchUsageThreshold,
          arcaneSurgePreReqs: this.arcaneSurgePreReqs.arcaneSurgePreReqThresholds,
          arcaneHarmonyPreReqs: this.arcaneSurgePreReqs.arcaneHarmonyPreReqThresholds,
          radiantSparkPreReqs: this.arcaneSurgePreReqs.radiantSparkPreReqThresholds,
          arcaneSurgeActiveTime: this.arcaneSurgeActiveTime.arcaneSurgeActiveTimeThresholds,
          arcaneSurgeManaUtilization: this.arcaneSurgeMana.arcaneSurgeManaUtilization,
          ruleOfThreesUsage: this.ruleOfThrees.ruleOfThreesUtilizationThresholds,
          timeAnomalyManaUtilization: this.timeAnomaly.timeAnomalyManaThresholds,
          arcaneMissilesUtilization: this.arcaneMissiles.arcaneMissileUsageThresholds,
          manaOnKill: this.manaValues.suggestionThresholds,
          arcaneIntellectUptime: this.arcaneIntellect.suggestionThresholds,
          cancelledCasts: this.cancelledCasts.suggestionThresholds,
          radiantSparkUtilization: this.radiantSpark.radiantSparkUsageThresholds,
        }}
      />
    );
  }
}

export default Checklist;
