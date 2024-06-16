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
import ManaValues from '../ManaChart/ManaValues';
import ArcaneOrb from '../talents/ArcaneOrb';
import TouchOfTheMagi from '../talents/TouchOfTheMagi';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    arcaneOrb: ArcaneOrb,
    arcaneSurgePreReqs: ArcaneSurgePreReqs,
    arcaneSurgeMana: ArcaneSurgeMana,
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
  protected arcaneOrb!: ArcaneOrb;
  protected arcaneSurgePreReqs!: ArcaneSurgePreReqs;
  protected arcaneSurgeMana!: ArcaneSurgeMana;
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
          arcaneOrbMissedOrbs: this.arcaneOrb.missedOrbsThresholds,
          arcaneSurgePreReqs: this.arcaneSurgePreReqs.arcaneSurgeThresholds,
          siphonStormPreReqs: this.arcaneSurgePreReqs.siphonStormThresholds,
          arcaneSurgeManaUtilization: this.arcaneSurgeMana.arcaneSurgeManaUtilization,
          touchMagiBadUses: this.touchOfTheMagi.touchOfTheMagiUtilization,
          touchMagiOverlap: this.touchOfTheMagi.touchOfTheMagiOverlap,
          timeAnomalyManaUtilization: this.timeAnomaly.timeAnomalyManaThresholds,
          arcaneMissilesUtilization: this.arcaneMissiles.arcaneMissileUsageThresholds,
          manaOnKill: this.manaValues.suggestionThresholds,
          arcaneIntellectUptime: this.arcaneIntellect.suggestionThresholds,
          cancelledCasts: this.cancelledCasts.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
