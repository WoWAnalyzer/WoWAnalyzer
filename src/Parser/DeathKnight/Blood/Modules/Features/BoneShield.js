import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import StatTracker from 'Parser/Core/Modules/StatTracker';

const SKELETAL_SHATTERING_DR = 0.08;
const BONE_SHIELD_DR = 0.16;

class BoneShield extends Analyzer {

  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
  };

  hasSS = false;
  hasSD = false;

  boneShieldMitigated = 0;
  skeletalShatteringMitigated = 0;


  on_initialized() {
    this.hasSS = this.combatants.selected.traitsBySpellId[SPELLS.SKELETAL_SHATTERING_TRAIT.id];
    this.hasSD = this.combatants.selected.hasTalent(SPELLS.SPECTRAL_DEFLECTION_TALENT.id);
  }

  get boneShieldAbsorbTooltip() {
    return formatNumber(this.boneShieldMitigated + this.skeletalShatteringMitigated) + " Bone Shield Absorb<br>";
  }

  get skeletalShatteringTooltip() {
    if (this.hasSS) {
      return "On average, Skeletal Shattering would have contributed " + 
        formatPercentage(this.skeletalShatteringMitigated / (this.boneShieldMitigated + this.skeletalShatteringMitigated)) +
        "% (" + formatNumber(this.skeletalShatteringMitigated) + ") to this.<br>";
    } else {
      return "";
    }
  }



  on_toPlayer_damage(event) {

    if (!this.combatants.selected.hasBuff(SPELLS.BONE_SHIELD.id)) {
      return;
    }

    const preMitigatedBoneShield = (event.amount + event.absorbed) / (1 - BONE_SHIELD_DR);
    this.boneShieldMitigated += preMitigatedBoneShield * BONE_SHIELD_DR;

    if (this.hasSS) {
      const preMitigatedSkeletalShattering = (event.amount + event.absorbed) / (1 - BONE_SHIELD_DR - SKELETAL_SHATTERING_DR);
      this.skeletalShatteringMitigated += preMitigatedSkeletalShattering * SKELETAL_SHATTERING_DR * this.statTracker.currentCritPercentage;
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
