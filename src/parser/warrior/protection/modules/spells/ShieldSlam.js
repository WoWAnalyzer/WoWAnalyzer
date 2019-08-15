import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ResourceLink from 'common/ResourceLink';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import StatTracker from 'parser/shared/modules/StatTracker';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

const debug = false;

class ShieldBlock extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    abilityTracker: AbilityTracker,
  };
  
  timeOnCd = 0;//total time its not on cd
  currentCd = 0;
  lastCast = 0;
  averageCd = 0;
  actualCasts = 0;

  totalCastsAssumed = 0;

  constructor(...args) {
    super(...args);
    this.lastCast = this.owner.fight.start_time/1000;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (SPELLS.SHIELD_SLAM.id !== spellId) {
      return;
    } 

    if(this.currentCd === 0){//we then know this is the first cast
      this.timeOnCd = event.timestamp/1000 - this.owner.fight.start_time/1000;
    }

    if((event.timestamp/1000 - this.lastCast) * 1.05 > this.currentCd){//normal cast
      this.timeOnCd += event.timestamp/1000 - this.lastCast;
    }

    if(this.currentCd !== 0){
      this.averageCd += this.currentCd;
    }

    this.currentCd = 9 / (1 + this.statTracker.hastePercentage(this.statTracker.currentHasteRating));
    this.lastCast = event.timestamp/1000;

    this.totalCastsAssumed += 1;

  }

  on_fightend(){
    this.actualCasts = this.abilityTracker.getAbility(SPELLS.SHIELD_SLAM.id).casts;
    if((this.owner.fight.end_time/1000 - this.lastCast) *1.05 > this.currentCd){
      this.timeOnCd += this.owner.fight.end_time/1000 - this.lastCast;
    }
    this.averageCd = this.averageCd / this.totalCastsAssumed;
    this.totalCastsAssumed += (this.timeOnCd/this.averageCd);
    this.totalCastsAssumed = parseInt(this.totalCastsAssumed);
    if(debug){
      console.log('assumed max shield slam casts: ' + this.totalCastsAssumed);
      console.log('time on cd: ' + this.timeOnCd);
      console.log('current cd: ' + this.currentCd);
      console.log('last cast:' + this.lastCast);
      console.log('averageCd: ' + this.averageCd);
      console.log('actual casts ' + this.actualCasts);
    }
  }

  get slamRatio(){
    return this.actualCasts/this.totalCastsAssumed;
  }
  
  get suggestionThresholds(){
    return {
      actual: this.slamRatio,
      isLessThan: {
        minor: .90,
        average: .80,
        major: .70,
      },
      style: 'percentage',
    };
  }
 
  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          Try to cast <SpellLink id={SPELLS.SHIELD_SLAM.id} />  more often - it is your main  <ResourceLink id={RESOURCE_TYPES.RAGE.id} />  generator and damage source.
        </>
      )
        .icon(SPELLS.SHIELD_SLAM.icon)
        .actual(`${this.actualCasts} shield slam casts`)
        .recommended(`${(recommended * this.totalCastsAssumed).toFixed(0)} recommended out of ${this.totalCastsAssumed} maximum`);
    });
  }
}

export default ShieldBlock;
