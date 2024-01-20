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
import ArcaneSurgeMana from '../core/ArcaneSurgeMana';
import ArcaneSurgePreReqs from '../core/ArcaneSurgePreReqs';
import RadiantSpark from '../talents/RadiantSpark';
import ManaValues from '../ManaChart/ManaValues';
import ArcaneFamiliar from '../talents/ArcaneFamiliar';
import ArcaneOrb from '../talents/ArcaneOrb';
import RuleOfThrees from '../talents/RuleOfThrees';
import TouchOfTheMagi from '../talents/TouchOfTheMagi';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    arcaneFamiliar: ArcaneFamiliar,
    arcaneOrb: ArcaneOrb,
    arcaneSurgePreReqs: ArcaneSurgePreReqs,
    arcaneSurgeMana: ArcaneSurgeMana,
    radiantSpark: RadiantSpark,
    ruleOfThrees: RuleOfThrees,
    touchOfTheMagi: TouchOfTheMagi,
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
  protected arcaneSurgePreReqs!: ArcaneSurgePreReqs;
  protected arcaneSurgeMana!: ArcaneSurgeMana;
  protected radiantSpark!: RadiantSpark;
  protected ruleOfThrees!: RuleOfThrees;
  protected touchOfTheMagi!: TouchOfTheMagi;
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
          arcaneSurgePreReqs: this.arcaneSurgePreReqs.arcaneSurgeThresholds,
          radiantSparkPreReqs: this.arcaneSurgePreReqs.radiantSparkThresholds,
          siphonStormPreReqs: this.arcaneSurgePreReqs.siphonStormThresholds,
          arcaneSurgeManaUtilization: this.arcaneSurgeMana.arcaneSurgeManaUtilization,
          ruleOfThreesUsage: this.ruleOfThrees.ruleOfThreesUtilizationThresholds,
          touchMagiBadUses: this.touchOfTheMagi.touchOfTheMagiUtilization,
          touchMagiOverlap: this.touchOfTheMagi.touchOfTheMagiOverlap,
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
