import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  EventType,
  FightEndEvent,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TALENTS from 'common/TALENTS/warrior';

const MAX_STACKS = 5;
const HASTE_PER_STACK = 2;

//update haste per stack in ./core/Haste.tsx aswell

class IntoTheFray extends Analyzer {
  buffStacks: number[][] = Array.from({ length: MAX_STACKS + 1 }, () => [0]);
  lastStacks = 0;
  lastUpdate = this.owner.fight.start_time;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.INTO_THE_FRAY_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INTO_THE_FRAY_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.INTO_THE_FRAY_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.INTO_THE_FRAY_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.INTO_THE_FRAY_BUFF),
      this.handleStacks,
    );
    this.addEventListener(Events.fightend, this.fightEnd);
  }

  get averageHaste() {
    let avgStacks = 0;
    this.buffStacks.forEach((elem, index) => {
      avgStacks += (elem.reduce((a, b) => a + b) / this.owner.fightDuration) * index;
    });
    return (avgStacks * HASTE_PER_STACK).toFixed(2);
  }

  handleStacks(
    event:
      | ApplyBuffEvent
      | ApplyBuffStackEvent
      | RemoveBuffEvent
      | RemoveBuffStackEvent
      | FightEndEvent,
    stack?: number,
  ) {
    const stackEvent = event as typeof event & { stack: number };
    if (stackEvent.type === EventType.RemoveBuff || isNaN(stackEvent.stack)) {
      // NaN check if player is dead during on_finish
      stackEvent.stack = 0;
    }
    if (event.type === EventType.ApplyBuff) {
      stackEvent.stack = 1;
    }

    if (stack) {
      stackEvent.stack = stack;
    }

    this.buffStacks[this.lastStacks].push(stackEvent.timestamp - this.lastUpdate);
    this.lastUpdate = stackEvent.timestamp;
    this.lastStacks = stackEvent.stack;
  }

  fightEnd(event: FightEndEvent) {
    this.handleStacks(event, this.lastStacks);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        dropdown={
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Haste-Bonus</th>
                <th>Time (s)</th>
                <th>Time (%)</th>
              </tr>
            </thead>
            <tbody>
              {this.buffStacks.map((e, i) => (
                <tr key={i}>
                  <th>{(i * HASTE_PER_STACK).toFixed(0)}%</th>
                  <td>{formatDuration(e.reduce((a, b) => a + b, 0))}</td>
                  <td>
                    {formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink spell={TALENTS.INTO_THE_FRAY_TALENT} /> average haste gained
            </>
          }
        >
          {this.averageHaste}%
        </BoringValueText>
      </Statistic>
    );
  }
}

export default IntoTheFray;
