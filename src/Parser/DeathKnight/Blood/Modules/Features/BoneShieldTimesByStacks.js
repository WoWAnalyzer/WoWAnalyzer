import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';

/* 
  boneShieldTimesByStacks() returns an array with the durations of each BS charge
*/

const MAX_BONE_SHIELD_STACKS = 10;

class BoneShieldStacksBySeconds extends Analyzer {
  boneShieldStacks = [];
  lastBoneShieldStack = 0;
  lastBoneShieldUpdate = this.owner.fight.start_time;

  on_initialized() {
    this.boneShieldStacks = Array.from({length: MAX_BONE_SHIELD_STACKS + 1}, x => []);
  }

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

    this.boneShieldStacks[this.lastBoneShieldStack].push(event.timestamp - this.lastBoneShieldUpdate);
    this.lastBoneShieldUpdate = event.timestamp;
    this.lastBoneShieldStack = event.stack;
  }

  get boneShieldTimesByStacks() {
    return this.boneShieldStacks;
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