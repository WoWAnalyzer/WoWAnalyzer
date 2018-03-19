import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import StatTracker from 'Parser/Core/Modules/StatTracker';

class BoneShield extends Analyzer {

  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
  };

  SS_DR = 0.08;
  BONE_SHIELD_DR = 0.16;

  totalDamageTaken = 0;

  hasSS = false;
  hasSD = false;

  totalCrit = 0;
  totalCritChecks = 0;

  boneShieldDR = 0.16;
  ssDR = 0;


  on_initialized() {
    this.hasSS = this.combatants.selected.traitsBySpellId[SPELLS.SKELETAL_SHATTERING_TRAIT.id];
    this.hasSD = this.combatants.selected.hasTalent(SPELLS.SPECTRAL_DEFLECTION_TALENT.id);
  }

  get boneShieldAbsorbTooltip() {
    if (this.hasSS) {
      const avgCrit = this.totalCrit / this.totalCritChecks;
      this.ssDR = avgCrit * this.SS_DR;
      this.boneShieldDR = this.BONE_SHIELD_DR + this.ssDR;
    }

    return formatNumber(this.totalDamageTaken * this.boneShieldDR) + " Bone Shield Absorb<br>";
  }

  get skeletalShatteringTooltip() {
    if (this.hasSS) {
      return "On average, Skeletal Shattering would have contributed ~" + formatNumber(this.totalDamageTaken * this.ssDR) + " to this.<br>";
    } else {
      return "";
    }
  }



  on_toPlayer_damage(event) {

    if (!this.combatants.selected.hasBuff(SPELLS.BONE_SHIELD.id)) {
      return;
    }

    this.totalDamageTaken += event.amount + event.absorbed;

    this.totalCrit += this.statTracker.currentCritPercentage;
    this.totalCritChecks += 1;
  }

  on_byPlayer_absorbed(event) {
    if(!this.combatants.selected.hasBuff(SPELLS.BONE_SHIELD.id)) {
      return;
    }
  }

  get uptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.BONE_SHIELD.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: .8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest('Your Bone Shield uptime can be improved. Try to keep it up at all times.')
            .icon(SPELLS.BONE_SHIELD.icon)
            .actual(`${formatPercentage(actual)}% Bone Shield uptime`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`);
        });
  }

  statistic() {

    if (this.hasSD) {

      return (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.BONE_SHIELD.id} />}
          value={`${formatPercentage(this.uptime)} %`}
          label="Bone Shield Uptime"
        />
  
      );

    } else {

      return (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.BONE_SHIELD.id} />}
          value={`${formatPercentage(this.uptime)} %`}
          label="Bone Shield Uptime"
          tooltip={`~${ this.boneShieldAbsorbTooltip }
          ${ this.skeletalShatteringTooltip }
          <b>Those numbers are estimates as it's not possible to track the actual Bone Shield absorb.</b>`}
        />
  
      );

    }
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default BoneShield;
