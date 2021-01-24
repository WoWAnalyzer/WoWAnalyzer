import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, EventType, FightEndEvent, RemoveBuffEvent, RemoveBuffStackEvent } from 'parser/core/Events';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';

/*
  unlimitedPowerTimesByStacks() returns an array with the durations of each BS charge
*/

const MAX_UP_STACKS = 20; //might need to be increased

class UnlimitedPowerTimesByStacks extends Analyzer {
  unlimitedPowerStacks: number[][] = [];
  lastUPStack = 0;
  lastUPUpdate = this.owner.fight.start_time;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.UNLIMITED_POWER_TALENT.id);

    this.unlimitedPowerStacks = Array.from({ length: MAX_UP_STACKS + 1 }, x => []);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.UNLIMITED_POWER_BUFF), this.handleStacks);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.UNLIMITED_POWER_BUFF), this.handleStacks);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.UNLIMITED_POWER_BUFF), this.handleStacks);
    this.addEventListener(Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.UNLIMITED_POWER_BUFF), this.handleStacks);
    this.addEventListener(Events.fightend, this.handleStacks);
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

  handleStacks(event: ApplyBuffEvent | RemoveBuffEvent | ApplyBuffStackEvent | RemoveBuffStackEvent | FightEndEvent) {
    this.unlimitedPowerStacks[this.lastUPStack].push(event.timestamp - this.lastUPUpdate);
    if (event.type === EventType.FightEnd) {
      return;
    }
    this.lastUPUpdate = event.timestamp;
    this.lastUPStack = currentStacks(event);
  }
}

export default UnlimitedPowerTimesByStacks;
