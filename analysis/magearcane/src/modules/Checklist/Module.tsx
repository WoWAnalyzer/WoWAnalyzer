import { ArcaneIntellect, CancelledCasts, MirrorImage, RuneOfPower } from '@wowanalyzer/mage';

import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

import ArcaneFamiliar from '../talents/ArcaneFamiliar';
import ArcaneOrb from '../talents/ArcaneOrb';
import ArcaneEcho from '../talents/ArcaneEcho';
import ArcanePower from '../features/ArcanePower';
import ArcanePowerActiveTime from '../features/ArcanePowerActiveTime';
import RuleOfThrees from '../talents/RuleOfThrees';
import TimeAnomaly from '../talents/TimeAnomaly';
import ArcaneMissiles from '../features/ArcaneMissiles';
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import ManaValues from '../ManaChart/ManaValues';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    arcaneFamiliar: ArcaneFamiliar,
    arcaneOrb: ArcaneOrb,
    arcaneEcho: ArcaneEcho,
    arcanePower: ArcanePower,
    arcanePowerActiveTime: ArcanePowerActiveTime,
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
  protected arcanePower!: ArcanePower;
  protected arcanePowerActiveTime!: ArcanePowerActiveTime;
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
          arcanePowerCooldown: this.arcanePower.arcanePowerCooldownThresholds,
          arcanePowerActiveTime: this.arcanePowerActiveTime.arcanePowerActiveTimeThresholds,
          arcanePowerManaUtilization: this.arcanePower.arcanePowerManaUtilization,
          arcanePowerCasts: this.arcanePower.arcanePowerCastThresholds,
          ruleOfThreesUsage: this.ruleOfThrees.ruleOfThreesUtilizationThresholds,
          timeAnomalyManaUtilization: this.timeAnomaly.timeAnomalyManaThresholds,
          arcaneMissilesUtilization: this.arcaneMissiles.arcaneMissileUsageThresholds,
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
