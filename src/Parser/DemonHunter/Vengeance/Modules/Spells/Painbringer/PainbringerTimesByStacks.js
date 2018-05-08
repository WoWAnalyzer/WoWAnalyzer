import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';

/*
  painbringerTimesByStacks() returns an array with the durations of each BS charge
*/

const MAX_PAINBRINGER_STACKS = 5;

class PainbringerStacksBySeconds extends Analyzer {
  painbringerStacks = [];
  lastPainbringerStack = 0;
  lastPainbringerUpdate = this.owner.fight.start_time;
  stackChanges = 0;
  totalPainbringerStacks = 0;

  on_initialized() {
    this.painbringerStacks = Array.from({length: MAX_PAINBRINGER_STACKS + 1}, x => []);
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

    this.painbringerStacks[this.lastPainbringerStack].push(event.timestamp - this.lastPainbringerUpdate);
    this.lastPainbringerUpdate = event.timestamp;
    this.lastPainbringerStack = event.stack;
    this.stackChanges += 1;
    this.totalPainbringerStacks += this.lastPainbringerStack;
    //console.log("stack changes# ", this.stackChanges, " | total: ", this.totalPainbringerStacks);
  }

  get painbringerTimesByStacks() {
    return this.painbringerStacks;
  }


  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.PAINBRINGER_Buff.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_applybuffstack(event) {
    if (event.ability.guid !== SPELLS.PAINBRINGER_Buff.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.PAINBRINGER_Buff.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_removebuffstack(event) {
    if (event.ability.guid !== SPELLS.PAINBRINGER_Buff.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_finished(event) {
    this.handleStacks(event, this.lastPainbringerStack);
  }
}

export default PainbringerStacksBySeconds;
