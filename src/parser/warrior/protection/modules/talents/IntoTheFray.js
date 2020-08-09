import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatDuration, formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events, { EventType } from 'parser/core/Events';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';

const MAX_STACKS = 5;
const HASTE_PER_STACK = 3;

//update haste per stack in ./core/Haste.js aswell

class IntoTheFray extends Analyzer {
  buffStacks = [];
  lastStacks = 0;
  lastUpdate = this.owner.fight.start_time;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.INTO_THE_FRAY_TALENT.id);
    this.buffStacks = Array.from({ length: MAX_STACKS + 1 }, x => [0]);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INTO_THE_FRAY_BUFF), this.handleStacks);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.INTO_THE_FRAY_BUFF), this.handleStacks);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.INTO_THE_FRAY_BUFF), this.handleStacks);
    this.addEventListener(Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.INTO_THE_FRAY_BUFF), this.handleStacks);
    this.addEventListener(Events.fightend, this.handleStacks);
  }

  handleStacks(event) {
    this.buffStacks[this.lastStacks].push(event.timestamp - this.lastUpdate);
    if (event.type === EventType.FightEnd) {
      return;
    }
    this.lastStacks = currentStacks(event);
    this.lastUpdate = event.timestamp;
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

  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default IntoTheFray;
