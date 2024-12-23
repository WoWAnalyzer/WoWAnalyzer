import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import { FEEL_THE_BURN_MAX_STACKS } from 'analysis/retail/mage/shared';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  EventType,
  FightEndEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';

class FeelTheBurn extends Analyzer {
  /** Array keeps track of how much time was spent at each Feel the Burn stack count.
   *  Index is stack count, value is accumulated time at that stack count */
  timeAtStackCount: number[];
  lastStackChangeTime: number = this.owner.fight.start_time;
  lastStackCount: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FEEL_THE_BURN_TALENT);

    this.timeAtStackCount = new Array(FEEL_THE_BURN_MAX_STACKS + 1).fill(0);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FEEL_THE_BURN_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.FEEL_THE_BURN_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.FEEL_THE_BURN_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.FEEL_THE_BURN_BUFF),
      this.handleStacks,
    );
    this.addEventListener(Events.fightend, this.handleStacks);
  }

  handleStacks(
    event:
      | ApplyBuffEvent
      | ApplyBuffStackEvent
      | RemoveBuffEvent
      | RemoveBuffStackEvent
      | FightEndEvent,
  ) {
    this.timeAtStackCount[this.lastStackCount] += event.timestamp - this.lastStackChangeTime;
    if (event.type === EventType.FightEnd) {
      return;
    }
    this.lastStackChangeTime = event.timestamp;
    this.lastStackCount = currentStacks(event);
  }

  get averageStacks() {
    const durationTimesStacks = this.timeAtStackCount.reduce((prev, n, i) => prev + n * i, 0);
    return durationTimesStacks / this.owner.fightDuration;
  }

  get buffUptimeMS() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FEEL_THE_BURN_BUFF.id);
  }

  get buffUptimePercent() {
    return this.buffUptimeMS / this.owner.fightDuration;
  }

  get feelTheBurnUptimeThresholds() {
    return {
      actual: this.buffUptimePercent,
      isLessThan: {
        minor: 0.98,
        average: 0.95,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default FeelTheBurn;
