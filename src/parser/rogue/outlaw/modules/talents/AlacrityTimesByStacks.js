import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';

/*
  alacrityTimesByStacks() returns an array with the durations of each BS charge
*/

const MAX_ALA_STACKS = 5;

class AlacrityTimesByStacks extends Analyzer {
  alacrityStacks = [];
  lastAlaStack = 0;
  lastAlaUpdate = this.owner.fight.start_time;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ALACRITY_TALENT.id);

    this.alacrityStacks = Array.from({length: MAX_ALA_STACKS + 1}, x => []);
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

    this.alacrityStacks[this.lastAlaStack].push(event.timestamp - this.lastAlaUpdate);
    this.lastAlaUpdate = event.timestamp;
    this.lastAlaStack = event.stack;
  }

  get alacrityTimesByStacks() {
    return this.alacrityStacks;
  }

  get averageAlacrityStacks() {
    let avgStacks = 0;
    this.alacrityStacks.forEach((elem, index) => {
      avgStacks += elem.reduce((a, b) => a + b, 0) / this.owner.fightDuration * index;
    });
    return avgStacks;
  }

  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.ALACRITY_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_applybuffstack(event) {
    if (event.ability.guid !== SPELLS.ALACRITY_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.ALACRITY_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_removebuffstack(event) {
    if (event.ability.guid !== SPELLS.ALACRITY_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_fightend(event) {
    this.handleStacks(event, this.averageAlacrityStacks);
  }
}

export default AlacrityTimesByStacks;
