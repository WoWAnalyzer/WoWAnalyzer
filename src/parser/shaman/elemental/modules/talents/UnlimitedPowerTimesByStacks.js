import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

/*
  unlimitedPowerTimesByStacks() returns an array with the durations of each BS charge
*/

const MAX_UP_STACKS = 20; //might need to be increased

class UnlimitedPowerTimesByStacks extends Analyzer {
  unlimitedPowerStacks = [];
  lastUPStack = 0;
  lastUPUpdate = this.owner.fight.start_time;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.UNLIMITED_POWER_TALENT.id);

    this.unlimitedPowerStacks = Array.from({length: MAX_UP_STACKS + 1}, x => []);
  }

  handleStacks(event, stack = null) {
    if (event.type === EventType.RemoveBuff || isNaN(event.stack)) { //NaN check if player is dead during on_finish
      event.stack = 0;
    }
    if (event.type === EventType.ApplyBuff) {
      event.stack = 1;
    }

    if (stack) {
      event.stack = stack;
    }

    this.unlimitedPowerStacks[this.lastUPStack].push(event.timestamp - this.lastUPUpdate);
    this.lastUPUpdate = event.timestamp;
    this.lastUPStack = event.stack;
  }

  get unlimitedPowerTimesByStacks() {
    return this.unlimitedPowerStacks;
  }

  get averageUnlimitedPowerStacks() {
    let avgStacks = 0;
    this.unlimitedPowerStacks.forEach((elem, index) => {
      avgStacks += elem.reduce((a, b) => a + b, 0) / this.owner.fightDuration * index;
    });
    return avgStacks;
  }

  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.UNLIMITED_POWER_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_applybuffstack(event) {
    if (event.ability.guid !== SPELLS.UNLIMITED_POWER_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.UNLIMITED_POWER_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_removebuffstack(event) {
    if (event.ability.guid !== SPELLS.UNLIMITED_POWER_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_fightend(event) {
    this.handleStacks(event, this.averageUnlimitedPowerStacks);
  }
}

export default UnlimitedPowerTimesByStacks;
