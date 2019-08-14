import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import StatTracker from 'parser/shared/modules/StatTracker';

const debug = true;

class ShieldBlock extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };
  
  timeOnCd = 0;//total time its not on cd
  currentCd = 0;
  lastCast = 0;
  averageCd = 0;

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
    if((this.owner.fight.end_time/1000 - this.lastCast) *1.05 > this.currentCd){
      this.timeOnCd += this.owner.fight.end_time/1000 - this.lastCast;
    }
    this.averageCd = this.averageCd / this.totalCastsAssumed;
    this.totalCastsAssumed += (this.timeOnCd/this.averageCd);
    if(debug){
      console.log('assumed max shield slam casts: ' + this.totalCastsAssumed);
      console.log('time on cd: ' + this.timeOnCd);
      console.log('current cd: ' + this.currentCd);
      console.log('last cast:' + this.lastCast);
      console.log('averageCd: ' + this.averageCd);
    }
  }

  
  get suggestionThresholds(){
    return {
      actual: this.totalCastsAssumed/this.totalCastsAssumed,
      isGreaterThan: {
        minor: .10,
        average: .30,
        major: .40,
      },
      style: 'percentage',
    };
  }
 
}

export default ShieldBlock;
