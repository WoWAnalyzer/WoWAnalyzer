import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatDuration, formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import StatisticBox from 'interface/others/StatisticBox';
import { EventType } from 'parser/core/Events';

const MAX_STACKS = 3;
const HASTE_PER_STACK = 3;

class Starlord extends Analyzer {

  buffStacks = [];
  lastStacks = 0;
  lastUpdate = this.owner.fight.start_time;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STARLORD_TALENT.id);
    this.buffStacks = Array.from({ length: MAX_STACKS + 1 }, x => [0]);
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

    this.buffStacks[this.lastStacks].push(event.timestamp - this.lastUpdate);
    this.lastUpdate = event.timestamp;
    this.lastStacks = event.stack;
  }

  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.STARLORD.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_applybuffstack(event) {
    if (event.ability.guid !== SPELLS.STARLORD.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.STARLORD.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_removebuffstack(event) {
    if (event.ability.guid !== SPELLS.STARLORD.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_fightend(event) {
    this.handleStacks(event, this.lastStacks);
  }

  get averageHaste() {
    let avgStacks = 0;
    this.buffStacks.forEach((elem, index) => {
      avgStacks += elem.reduce((a, b) => a + b) / this.owner.fightDuration * index;
    });
    return (avgStacks * HASTE_PER_STACK).toFixed(2);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.STARLORD_TALENT.id} />}
        value={`${this.averageHaste} %`}
        label="Average haste gained"
      >
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
                <td>{formatDuration(e.reduce((a, b) => a + b, 0) / 1000)}</td>
                <td>{formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </StatisticBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(5);
}

export default Starlord;
