import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

/*  this.selectedCombatant.getStackWeightedBuffUptime() gives a lower than expected average of stacks if the buff persists through combat end
 *  Inspired by UnlimitedPower module in Elemental Shaman
 */

const MAX_RI_STACKS = 20; //might need to be increased

class RelentlessInquisitorStackHandler extends Analyzer {
  relentlessInquisitorStacks = [];
  lastRIStack = 0;
  lastRIUpdate = this.owner.fight.start_time;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.RELENTLESS_INQUISITOR.id);

    this.relentlessInquisitorStacks = Array.from({length: MAX_RI_STACKS + 1}, x => []);
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

    this.relentlessInquisitorStacks[this.lastRIStack].push(event.timestamp - this.lastRIUpdate);
    this.lastRIUpdate = event.timestamp;
    this.lastRIStack = event.stack;
  }

  get averageStacks() {
    let avgStacks = 0;
    this.relentlessInquisitorStacks.forEach((elem, index) => {
      avgStacks += elem.reduce((a, b) => a + b, 0) / this.owner.fightDuration * index;
    });
    return avgStacks;
  }

  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.RELENTLESS_INQUISITOR_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_applybuffstack(event) {
    if (event.ability.guid !== SPELLS.RELENTLESS_INQUISITOR_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.RELENTLESS_INQUISITOR_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_removebuffstack(event) {
    if (event.ability.guid !== SPELLS.RELENTLESS_INQUISITOR_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_fightend(event) {
    this.handleStacks(event, this.averageRelentlessInquisitorStacks);
  }
}

export default RelentlessInquisitorStackHandler;
