import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';

/* 
  boneShieldStacksBySeconds() returns an array with the amount of stacks with an entry for each second
*/

class BoneShieldStacksBySeconds extends Analyzer {
  boneShield = [];
  boneShieldStacks = [];
  lastBoneShieldStack = 0;

  handleStacks(event, stack = null) {
    if (event.type === 'removebuff' || isNaN(event.stack)) { //NaN check if player is dead during on_finish
      event.stack = 0;
    }
    if (event.type === 'applybuff') {
      event.stack = 1;
    }

    if (stack) {
      event.stack = stack;
    }
    const second = Math.floor((event.timestamp - this.owner.fight.start_time) / 1000) - 1;
    //we have multiple BS-events per second, update existing entry if it exists or make a new one
    const secondExists = this.boneShieldStacks.findIndex(elem => elem.second === second);
    if (secondExists === -1) {
      this.boneShieldStacks.push({
        second: second,
        stack: event.stack,
      });
    } else {
      this.boneShieldStacks[secondExists] = {
        second: second,
        stack: event.stack,
      };
    }

    this.boneShield = Array.from({length: Math.ceil(this.owner.fightDuration / 1000)}, (x, i) => 0);
    this.boneShield.forEach((elem, index) => {
      this.lastBoneShieldStack = this.boneShieldStacks.find(e => e.second === index) ? this.boneShieldStacks.find(e => e.second === index).stack : this.lastBoneShieldStack;
      this.boneShield[index] = this.lastBoneShieldStack;
    });
  }

  get boneShieldStacksBySeconds() {
    return this.boneShield
  }

  
  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.BONE_SHIELD.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_applybuffstack(event) {
    if (event.ability.guid !== SPELLS.BONE_SHIELD.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.BONE_SHIELD.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_removebuffstack(event) {
    if (event.ability.guid !== SPELLS.BONE_SHIELD.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_finished(event) {
    this.handleStacks(event, this.lastBoneShieldStack);
  }
}

export default BoneShieldStacksBySeconds;
