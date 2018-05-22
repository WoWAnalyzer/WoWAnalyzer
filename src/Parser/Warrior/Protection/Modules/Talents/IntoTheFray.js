import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import { STATISTIC_ORDER } from 'Main/StatisticBox';
import ExpandableStatisticBox from 'Main/ExpandableStatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatPercentage, formatDuration } from 'common/format';

const MAX_STACKS = 5;
const HASTE_PER_STACK = 3;
//update haste per stack in ./Core/Haste.js aswell

class IntoTheFray extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  buffStacks = [];
  lastStacks = 0;
  lastUpdate = this.owner.fight.start_time;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.INTO_THE_FRAY_TALENT.id);
    this.buffStacks = Array.from({length: MAX_STACKS + 1}, x => [0]);
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

    this.buffStacks[this.lastStacks].push(event.timestamp - this.lastUpdate);
    this.lastUpdate = event.timestamp;
    this.lastStacks = event.stack;
  }

  
  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.INTO_THE_FRAY_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_applybuffstack(event) {
    if (event.ability.guid !== SPELLS.INTO_THE_FRAY_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.INTO_THE_FRAY_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_removebuffstack(event) {
    if (event.ability.guid !== SPELLS.INTO_THE_FRAY_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_finished(event) {
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
      <ExpandableStatisticBox
        icon={<SpellIcon id={SPELLS.INTO_THE_FRAY_TALENT.id} />}
        value={`${this.averageHaste}%`}
        label="average haste gained"
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
            {this.buffStacks.map((e, i) =>
              <tr key={i}>
                <th>{(i * HASTE_PER_STACK).toFixed(0)}%</th>
                <td>{formatDuration(e.reduce((a, b) => a + b, 0) / 1000)}</td>
                <td>{formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%</td>
              </tr>
            )}
          </tbody>
        </table>
      </ExpandableStatisticBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default IntoTheFray;
