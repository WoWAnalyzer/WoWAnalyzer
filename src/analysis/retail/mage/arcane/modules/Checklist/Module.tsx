import {
  ArcaneIntellect,
  CancelledCasts,
  MirrorImage,
  RuneOfPower,
} from 'analysis/retail/mage/shared';
import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import AlwaysBeCasting from '../features/AlwaysBeCasting';
import ArcaneMissiles from '../features/ArcaneMissiles';
import ArcanePowerActiveTime from '../features/ArcanePowerActiveTime';
import ArcanePowerMana from '../features/ArcanePowerMana';
import ArcanePowerPreReqs from '../features/ArcanePowerPreReqs';
import RadiantSpark from '../features/RadiantSpark';
import ManaValues from '../ManaChart/ManaValues';
import ArcaneEcho from '../talents/ArcaneEcho';
import ArcaneFamiliar from '../talents/ArcaneFamiliar';
import ArcaneOrb from '../talents/ArcaneOrb';
import RuleOfThrees from '../talents/RuleOfThrees';
import TimeAnomaly from '../talents/TimeAnomaly';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    arcaneFamiliar: ArcaneFamiliar,
    arcaneOrb: ArcaneOrb,
    arcaneEcho: ArcaneEcho,
    arcanePowerPreReqs: ArcanePowerPreReqs,
    arcanePowerMana: ArcanePowerMana,
    arcanePowerActiveTime: ArcanePowerActiveTime,
    radiantSpark: RadiantSpark,
    ruleOfThrees: RuleOfThrees,
    timeAnomaly: TimeAnomaly,
    arcaneMissiles: ArcaneMissiles,
    manaValues: ManaValues,
    arcaneIntellect: ArcaneIntellect,
    cancelledCasts: CancelledCasts,
    mirrorImage: MirrorImage,
    runeOfPower: RuneOfPower,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
  };
  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected arcaneFamiliar!: ArcaneFamiliar;
  protected arcaneOrb!: ArcaneOrb;
  protected arcaneEcho!: ArcaneEcho;
  protected arcanePowerPreReqs!: ArcanePowerPreReqs;
  protected arcanePowerMana!: ArcanePowerMana;
  protected arcanePowerActiveTime!: ArcanePowerActiveTime;
  protected radiantSpark!: RadiantSpark;
  protected ruleOfThrees!: RuleOfThrees;
  protected timeAnomaly!: TimeAnomaly;
  protected arcaneMissiles!: ArcaneMissiles;
  protected manaValues!: ManaValues;
  protected arcaneIntellect!: ArcaneIntellect;
  protected cancelledCasts!: CancelledCasts;
  protected mirrorImage!: MirrorImage;
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

          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          arcaneFamiliarUptime: this.arcaneFamiliar.arcaneFamiliarUptimeThresholds,
          arcaneOrbMissedOrbs: this.arcaneOrb.missedOrbsThresholds,
          arcaneEchoLowUsage: this.arcaneEcho.badTouchUsageThreshold,
          arcanePowerPreReqs: this.arcanePowerPreReqs.arcanePowerPreReqThresholds,
          arcaneHarmonyPreReqs: this.arcanePowerPreReqs.arcaneHarmonyPreReqThresholds,
          radiantSparkPreReqs: this.arcanePowerPreReqs.radiantSparkPreReqThresholds,
          arcanePowerActiveTime: this.arcanePowerActiveTime.arcanePowerActiveTimeThresholds,
          arcanePowerManaUtilization: this.arcanePowerMana.arcanePowerManaUtilization,
          ruleOfThreesUsage: this.ruleOfThrees.ruleOfThreesUtilizationThresholds,
          timeAnomalyManaUtilization: this.timeAnomaly.timeAnomalyManaThresholds,
          arcaneMissilesUtilization: this.arcaneMissiles.arcaneMissileUsageThresholds,
          manaOnKill: this.manaValues.suggestionThresholds,
          arcaneIntellectUptime: this.arcaneIntellect.suggestionThresholds,
          cancelledCasts: this.cancelledCasts.suggestionThresholds,
          runeOfPowerBuffUptime: this.runeOfPower.roundedSecondsSuggestionThresholds,
          runeOfPowerOverlaps: this.runeOfPower.overlappedRunesThresholds,
          radiantSparkUtilization: this.radiantSpark.radiantSparkUsageThresholds,
        }}
      />
    );
  }
}

export default Checklist;
