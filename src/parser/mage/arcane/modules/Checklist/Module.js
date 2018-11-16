import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist2/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist2/PreparationRuleAnalyzer';

import ArcaneFamiliar from '../features/ArcaneFamiliar';
import ArcaneOrb from '../features/ArcaneOrb';
import ArcanePower from '../features/ArcanePower';
import RuleOfThrees from '../features/RuleOfThrees';
import TimeAnomaly from '../features/TimeAnomaly';
import ArcaneMissiles from '../features/ArcaneMissiles';
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import ManaValues from '../ManaChart/ManaValues';
import ArcaneIntellect from '../../../shared/modules/features/ArcaneIntellect';
import CancelledCasts from '../../../shared/modules/features/CancelledCasts';
import MirrorImage from '../../../shared/modules/features/MirrorImage';
import RuneOfPower from '../../../shared/modules/features/RuneOfPower';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    arcaneFamiliar: ArcaneFamiliar,
    arcaneOrb: ArcaneOrb,
    arcanePower: ArcanePower,
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

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          arcaneFamiliarUptime: this.arcaneFamiliar.suggestionThresholds,
          arcaneOrbAverageHits: this.arcaneOrb.averageHitThresholds,
          arcanePowerCooldown: this.arcanePower.cooldownSuggestionThresholds,
          arcanePowerManaUtilization: this.arcanePower.manaUtilizationThresholds,
          arcanePowerCasts: this.arcanePower.castSuggestionThresholds,
          arcanePowerOnKill: this.arcanePower.arcanePowerOnKillSuggestionThresholds,
          ruleOfThreesUsage: this.ruleOfThrees.suggestionThresholds,
          timeAnomalyManaUtilization: this.timeAnomaly.manaUtilizationThresholds,
          arcaneMissilesUtilization: this.arcaneMissiles.missilesSuggestionThresholds,
          manaOnKill: this.manaValues.suggestionThresholds,
          arcaneIntellectUptime: this.arcaneIntellect.suggestionThresholds,
          cancelledCasts: this.cancelledCasts.suggestionThresholds,
          runeOfPowerBuffUptime: this.runeOfPower.roundedSecondsSuggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
