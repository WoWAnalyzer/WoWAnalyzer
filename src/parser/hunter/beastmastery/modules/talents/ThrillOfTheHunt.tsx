import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatDuration, formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import CriticalStrike from 'interface/icons/CriticalStrike';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, EventType, FightEndEvent, RemoveBuffEvent } from 'parser/core/Events';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';

/**
 * Barbed Shot increases your critical strike chance by 3% for 8 sec, stacking up to 3 times.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/Q9LghKR7ZPnAwFaH#fight=48&type=auras&source=280&ability=257946
 */

const MAX_THRILL_STACKS = 3;
const CRIT_PER_STACK = 0.03;

class ThrillOfTheHunt extends Analyzer {

  thrillStacks: Array<Array<number>> = [];
  lastThrillStack = 0;
  lastThrillUpdate = this.owner.fight.start_time;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.THRILL_OF_THE_HUNT_TALENT.id);
    if (!this.active) {
      return;
    }
    this.thrillStacks = Array.from({ length: MAX_THRILL_STACKS + 1 }, x => []);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.THRILL_OF_THE_HUNT_BUFF), (event: ApplyBuffEvent) => this.handleStacks(event));
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.THRILL_OF_THE_HUNT_BUFF), (event: ApplyBuffStackEvent) => this.handleStacks(event));
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.THRILL_OF_THE_HUNT_BUFF), (event: RemoveBuffEvent) => this.handleStacks(event));
    this.addEventListener(Events.fightend, (event: FightEndEvent) => this.handleStacks(event));
  }

  get thrillOfTheHuntTimesByStacks() {
    return this.thrillStacks;
  }

  get currentThrillCritPercentage() {
    return this.lastThrillStack * CRIT_PER_STACK;
  }

  get averageCritPercent() {
    let averageCrit = 0;
    this.thrillStacks.forEach((elem, index) => {
      averageCrit += elem.reduce((a, b) => a + b, 0) / this.owner.fightDuration * index * CRIT_PER_STACK;
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
        dropdown={(
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
                    <td>{formatDuration(e.reduce((a, b) => a + b, 0) / 1000)}</td>
                    <td>{formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%</td>
                    <td>{formatPercentage(CRIT_PER_STACK * i, 0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.THRILL_OF_THE_HUNT_TALENT}>
          <>
            <CriticalStrike /> {this.averageCritPercent}% <small>average Crit</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ThrillOfTheHunt;
