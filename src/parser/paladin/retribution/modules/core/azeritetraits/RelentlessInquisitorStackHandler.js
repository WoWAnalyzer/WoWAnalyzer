import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { EventType } from 'parser/core/Events';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';

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

    this.relentlessInquisitorStacks = Array.from({ length: MAX_RI_STACKS + 1 }, x => []);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RELENTLESS_INQUISITOR_BUFF), this.handleStacks);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.RELENTLESS_INQUISITOR_BUFF), this.handleStacks);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RELENTLESS_INQUISITOR_BUFF), this.handleStacks);
    this.addEventListener(Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.RELENTLESS_INQUISITOR_BUFF), this.handleStacks);
    this.addEventListener(Events.fightend, this.handleStacks);
  }

  handleStacks(event) {
    this.relentlessInquisitorStacks[this.lastRIStack].push(event.timestamp - this.lastRIUpdate);
    if (event.type === EventType.FightEnd) {
      return;
    }
    this.lastRIUpdate = event.timestamp;
    this.lastRIStack = currentStacks(event);
  }

  get averageStacks() {
    let avgStacks = 0;
    this.relentlessInquisitorStacks.forEach((elem, index) => {
      avgStacks += elem.reduce((a, b) => a + b, 0) / this.owner.fightDuration * index;
    });
    return avgStacks;
  }
}

export default RelentlessInquisitorStackHandler;
