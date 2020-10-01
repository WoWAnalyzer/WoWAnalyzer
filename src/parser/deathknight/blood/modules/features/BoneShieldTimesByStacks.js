import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { EventType } from 'parser/core/Events';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';

const MAX_BONE_SHIELD_STACKS = 10;

/**
 boneShieldTimesByStacks() returns an array with the durations of each BS charge
 */
class BoneShieldStacksBySeconds extends Analyzer {
  boneShieldStacks = [];
  lastBoneShieldStack = 0;
  lastBoneShieldUpdate = this.owner.fight.start_time;

  constructor(...args) {
    super(...args);
    this.boneShieldStacks = Array.from({ length: MAX_BONE_SHIELD_STACKS + 1 }, x => []);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BONE_SHIELD), this.handleStacks);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.BONE_SHIELD), this.handleStacks);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BONE_SHIELD), this.handleStacks);
    this.addEventListener(Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.BONE_SHIELD), this.handleStacks);
    this.addEventListener(Events.fightend, this.handleStacks);
  }

  handleStacks(event) {
    this.boneShieldStacks[this.lastBoneShieldStack].push(event.timestamp - this.lastBoneShieldUpdate);
    if (event.type === EventType.FightEnd) {
      return;
    }
    this.lastBoneShieldUpdate = event.timestamp;
    this.lastBoneShieldStack = currentStacks(event);
  }

  get boneShieldTimesByStacks() {
    return this.boneShieldStacks;
  }

  get averageBoneShieldStacks() {
    let avgStacks = 0;
    this.boneShieldStacks.forEach((elem, index) => {
      avgStacks += elem.reduce((a, b) => a + b, 0) / this.owner.fightDuration * index;
    });
    return avgStacks;
  }
}

export default BoneShieldStacksBySeconds;
