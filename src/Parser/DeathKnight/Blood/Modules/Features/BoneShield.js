import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatDuration, formatNumber } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import ExpandableStatisticBox from 'Main/ExpandableStatisticBox';
import StatTracker from 'Parser/Core/Modules/StatTracker';
import BoneShieldStacksBySeconds from './BoneShieldStacksBySeconds';

const SKELETAL_SHATTERING_DR = 0.08;
const BONE_SHIELD_DR = 0.16;
const MAX_BONE_SHIELD_STACKS = 10;

class BoneShield extends Analyzer {

  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
    boneShieldStacksBySeconds: BoneShieldStacksBySeconds,
  };

  hasSS = false;
  hasSD = false;

  boneShieldMitigated = 0;
  skeletalShatteringMitigated = 0;
  maxStacks = MAX_BONE_SHIELD_STACKS;


  on_initialized() {
    this.hasSS = this.combatants.selected.traitsBySpellId[SPELLS.SKELETAL_SHATTERING_TRAIT.id];
    this.hasSD = this.combatants.selected.hasTalent(SPELLS.SPECTRAL_DEFLECTION_TALENT.id);
  }

  get boneShieldAbsorbTooltip() {
    return formatNumber(this.boneShieldMitigated + this.skeletalShatteringMitigated) + " Bone Shield Absorb<br>";
  }

  get boneShieldStacks() {
    return this.boneShieldStacksBySeconds.boneShieldStacksBySeconds;
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
        <ExpandableStatisticBox
          icon={<SpellIcon id={SPELLS.BONE_SHIELD.id} />}
          value={`${formatPercentage(this.uptime)} %`}
          label="Bone Shield Uptime"
        >
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Stacks</th>
                <th>Time (s)</th>
                <th>Time (%)</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({length: this.maxStacks + 1}, (x, i) => i).map((e, i) =>
                <tr key={i}>
                  <th>{i}</th>
                  <td>{formatDuration(this.boneShieldStacks.filter(e => e === i).length)}</td>
                  <td>{formatPercentage(this.boneShieldStacks.filter(e => e === i).length / Math.ceil(this.owner.fightDuration / 1000))}%</td>
                </tr>
              )}
            </tbody>
          </table>
        </ExpandableStatisticBox>
  
      );

    } else {

      return (
        <ExpandableStatisticBox
          icon={<SpellIcon id={SPELLS.BONE_SHIELD.id} />}
          value={`${formatPercentage(this.uptime)} %`}
          label="Bone Shield Uptime"
          tooltip={`~${ this.boneShieldAbsorbTooltip }
          ${ this.skeletalShatteringTooltip }
          <b>Those numbers are estimates as it's not possible to track the actual Bone Shield absorb.</b>`}
        >
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Stacks</th>
                <th>Time (s)</th>
                <th>Time (%)</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({length: this.maxStacks + 1}, (x, i) => i).map((e, i) =>
                <tr key={i}>
                  <th>{i}</th>
                  <td>{formatDuration(this.boneShieldStacks.filter(e => e === i).length)}</td>
                  <td>{formatPercentage(this.boneShieldStacks.filter(e => e === i).length / Math.ceil(this.owner.fightDuration / 1000))}%</td>
                </tr>
              )}
            </tbody>
          </table>
        </ExpandableStatisticBox>
      );

    }
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default BoneShield;
