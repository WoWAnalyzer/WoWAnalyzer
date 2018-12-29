import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatDuration, formatPercentage } from 'common/format';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';

/**
 * Barbed Shot increases your critical strike chance by 3% for 8 sec, stacking up to 3 times.
 * Example log: https://www.warcraftlogs.com/reports/P6F8k1xJ3GD7Rm2h#fight=20&type=summary&source=306
 */

const MAX_THRILL_STACKS = 3;
const CRIT_PER_STACK = 0.03;

class ThrillOfTheHunt extends Analyzer {

  thrillStacks = [];
  lastThrillStack = 0;
  lastThrillUpdate = this.owner.fight.start_time;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.THRILL_OF_THE_HUNT_TALENT.id);
    if (!this.active) {
      return;
    }
    this.thrillStacks = Array.from({ length: MAX_THRILL_STACKS + 1 }, x => []);
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
    this.thrillStacks[this.lastThrillStack].push(event.timestamp - this.lastThrillUpdate);
    this.lastThrillUpdate = event.timestamp;
    this.lastThrillStack = event.stack;
  }

  get thrillOfTheHuntTimesByStacks() {
    return this.thrillStacks;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.THRILL_OF_THE_HUNT_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.THRILL_OF_THE_HUNT_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.THRILL_OF_THE_HUNT_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_fightend(event) {
    this.handleStacks(event, this.lastThrillStack);
  }

  get averageCritPercent() {
    let averageCrit = 0;
    this.thrillStacks.forEach((elem, index) => {
      averageCrit += elem.reduce((a, b) => a + b, 0) / this.owner.fightDuration * index * CRIT_PER_STACK;
    });
    return formatPercentage(averageCrit);
  }

  statistic() {
    return (
      <TalentStatisticBox
        talent={SPELLS.THRILL_OF_THE_HUNT_TALENT.id}
        value={`${this.averageCritPercent}% average Crit`}
      >
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
      </TalentStatisticBox>
    );
  }

}

export default ThrillOfTheHunt;
