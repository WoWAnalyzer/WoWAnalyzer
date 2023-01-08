import {
  CRIT_PER_THRILL_STACK,
  MAX_THRILL_STACKS,
} from 'analysis/retail/hunter/beastmastery/constants';
import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import CriticalStrike from 'interface/icons/CriticalStrike';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  EventType,
  FightEndEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Barbed Shot increases your critical strike chance by 3% for 8 sec, stacking up to 3 times.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/Q9LghKR7ZPnAwFaH#fight=48&type=auras&source=280&ability=257946
 */

class ThrillOfTheHunt extends Analyzer {
  thrillStacks: number[][] = [];
  lastThrillStack = 0;
  lastThrillUpdate = this.owner.fight.start_time;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.THRILL_OF_THE_HUNT_TALENT);
    if (!this.active) {
      return;
    }
    this.thrillStacks = Array.from({ length: MAX_THRILL_STACKS + 1 }, (x) => []);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.THRILL_OF_THE_HUNT_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.THRILL_OF_THE_HUNT_BUFF),
      this.handleStacks,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.THRILL_OF_THE_HUNT_BUFF),
      this.handleStacks,
    );
    this.addEventListener(Events.fightend, this.handleStacks);
  }

  get thrillOfTheHuntTimesByStacks() {
    return this.thrillStacks;
  }

  get currentThrillCritPercentage() {
    return this.lastThrillStack * CRIT_PER_THRILL_STACK;
  }

  get averageCritPercent() {
    let averageCrit = 0;
    this.thrillStacks.forEach((elem, index) => {
      averageCrit +=
        (elem.reduce((a, b) => a + b, 0) / this.owner.fightDuration) *
        index *
        CRIT_PER_THRILL_STACK;
    });
    return formatPercentage(averageCrit);
  }

  handleStacks(event: RemoveBuffEvent | ApplyBuffEvent | ApplyBuffStackEvent | FightEndEvent) {
    this.thrillStacks[this.lastThrillStack].push(event.timestamp - this.lastThrillUpdate);
    if (event.type === EventType.FightEnd) {
      return;
    }
    this.lastThrillUpdate = event.timestamp;
    this.lastThrillStack = currentStacks(event);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Stacks</th>
                  <th>Time (s)</th>
                  <th>Time (%)</th>
                  <th>Crit (%)</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(this.thrillOfTheHuntTimesByStacks).map((e, i) => (
                  <tr key={i}>
                    <th>{i}</th>
                    <td>{formatDuration(e.reduce((a, b) => a + b, 0))}</td>
                    <td>
                      {formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%
                    </td>
                    <td>{formatPercentage(CRIT_PER_THRILL_STACK * i, 0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.THRILL_OF_THE_HUNT_TALENT.id}>
          <>
            <CriticalStrike /> {this.averageCritPercent}% <small>average Crit</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ThrillOfTheHunt;
