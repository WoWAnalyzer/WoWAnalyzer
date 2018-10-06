import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import AbilityTracker from 'parser/core/modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Analyzer from 'parser/core/Analyzer';

const REFRESH_AT_STACKS_WITH_BONES_OF_THE_DAMNED = 6;
const REFRESH_AT_STACKS_WITHOUT_BONES_OF_THE_DAMNED = 7;
const REFRESH_AT_SECONDS = 6;
const BS_DURATION = 30;
const MR_GAIN = 3;

class MarrowrendUsage extends Analyzer {

  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  /*
    currentBoneShieldBuffer contains the BS stacks caused by the actual MR cast
    since the applyBuffStack event happens before the cast event
  */

  currentBoneShieldStacks = 0;
  currentBoneShieldBuffer = 0;
  lastMarrowrendCast = 0;

  bsStacksWasted = 0;
  badMRCasts = 0;
  refreshMRCasts = 0;
  totalMRCasts = 0;

  hasBonesOfTheDamned = false;
  refreshAtStacks = REFRESH_AT_STACKS_WITHOUT_BONES_OF_THE_DAMNED;

  bonesOfTheDamnedProc = 0;
  totalStacksGenerated = 0;

  constructor(...args) {
    super(...args);

    if(this.selectedCombatant.hasTrait(SPELLS.BONES_OF_THE_DAMNED.id)) {
      this.hasBonesOfTheDamned = true;
      this.refreshAtStacks = REFRESH_AT_STACKS_WITH_BONES_OF_THE_DAMNED;
    }
  }


  on_toPlayer_applybuff(event) {
    if (event.ability.guid === SPELLS.BONE_SHIELD.id){
      this.currentBoneShieldBuffer += 1;
      this.currentBoneShieldStacks += 1;
    }
  }

  on_toPlayer_applybuffstack(event) {
    if (event.ability.guid === SPELLS.BONE_SHIELD.id){
      this.currentBoneShieldBuffer += 1;
      this.currentBoneShieldStacks += 1;
    }
  }


  on_toPlayer_removebuff(event) {
    if (event.ability.guid === SPELLS.BONE_SHIELD.id){
      this.currentBoneShieldStacks = 0;
    }
  }

  on_toPlayer_removebuffstack(event) {
    if (event.ability.guid === SPELLS.BONE_SHIELD.id){
      this.currentBoneShieldBuffer = 0;
      this.currentBoneShieldStacks -= 1;
    }
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.MARROWREND.id) return;

    //don't add to wasted casts if MR casts was at ~6sec left on BS duration
    const durationLeft = BS_DURATION - (event.timestamp - this.lastMarrowrendCast) / 1000;
    if (durationLeft <= REFRESH_AT_SECONDS) {
      this.refreshMRCasts += 1;
    } else {
      const boneShieldStacks = this.currentBoneShieldStacks - this.currentBoneShieldBuffer;
      if (boneShieldStacks > this.refreshAtStacks) {
        this.badMRCasts += 1;
        const wasted = MR_GAIN - this.currentBoneShieldBuffer;
        if (wasted > 0) {
          this.bsStacksWasted += wasted;

          event.meta = event.meta || {};
          event.meta.isInefficientCast = true;
          event.meta.inefficientCastReason = `You made this cast with ${boneShieldStacks} stacks of Bone Shield while it had ${(durationLeft).toFixed(1)} seconds left.`;
        }
      }
    }

    if (this.currentBoneShieldBuffer > MR_GAIN && this.hasBonesOfTheDamned) {
      // count Bones of the Damned procs and mark cast in timeline
      event.meta = event.meta || {};
      event.meta.isEnhancedCast = true;
      event.meta.enhancedCastReason = `This ${SPELLS.MARROWREND.name} cast procced ${SPELLS.BONES_OF_THE_DAMNED.name}`;
      this.bonesOfTheDamnedProc += 1;
    }

    this.totalStacksGenerated += this.currentBoneShieldBuffer;
    this.currentBoneShieldBuffer = 0;
    this.lastMarrowrendCast = event.timestamp;
    this.totalMRCasts += 1;
  }

  get bonesOfTheDamnedProcs() {
    return this.bonesOfTheDamnedProc;
  }

  get totalBoneShieldStacksGenerated() {
    return this.totalStacksGenerated;
  }

  get badCastsPercent() {
    return this.badMRCasts / this.totalMRCasts;
  }

  get marrowrendCasts() {
    return this.totalMRCasts;
  }

  get suggestionThresholds() {
    return {
      actual: this.badCastsPercent,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: .2,
      },
      style: 'percentage',
    };
  }

  get suggestionThresholdsEfficiency() {
    return {
      actual: 1 - this.badCastsPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: .8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You casted {this.badMRCasts} Marrowrends with more than {this.refreshAtStacks} stacks of <SpellLink id={SPELLS.BONE_SHIELD.id} /> that were not about to expire. Try to cast <SpellLink id={SPELLS.HEART_STRIKE.id} /> instead under those conditions.</>)
          .icon(SPELLS.MARROWREND.icon)
          .actual(`${formatPercentage(actual)}% bad Marrowrend casts`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.MARROWREND.id} />}
        value={`${ this.badMRCasts } / ${ this.totalMRCasts }`}
        label="Bad Marrowrend casts"
        tooltip={`
          ${ this.refreshMRCasts } casts to refresh Bone Shield<br>
          ${ this.badMRCasts } casts with more than ${this.refreshAtStacks} stacks of Bone Shield wasting at least ${ this.bsStacksWasted } stacks<br>
          <br>
          Avoid casting Marrowrend unless you have ${this.refreshAtStacks} or less stacks or if Bone Shield has less than 6sec duration left.
        `}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default MarrowrendUsage;
