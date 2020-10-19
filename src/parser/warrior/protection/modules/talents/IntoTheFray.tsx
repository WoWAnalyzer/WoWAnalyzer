import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatDuration, formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, EventType, FightEndEvent, RemoveBuffEvent, RemoveBuffStackEvent } from 'parser/core/Events';

import Statistic from 'interface/statistics/Statistic';
import BoringValueText from 'interface/statistics/components/BoringValueText'
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import SpellLink from 'common/SpellLink';

const MAX_STACKS = 5;
const HASTE_PER_STACK = 2;

//update haste per stack in ./core/Haste.js aswell

class IntoTheFray extends Analyzer {
  buffStacks: number[][];
  lastStacks = 0;
  lastUpdate = this.owner.fight.start_time;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.INTO_THE_FRAY_TALENT.id);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INTO_THE_FRAY_BUFF), this.handleStacks);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.INTO_THE_FRAY_BUFF), this.handleStacks);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.INTO_THE_FRAY_BUFF), this.handleStacks);
    this.addEventListener(Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.INTO_THE_FRAY_BUFF), this.handleStacks);
    this.addEventListener(Events.fightend, this.fightEnd);
    this.buffStacks = Array.from({ length: MAX_STACKS + 1 }, () => [0]);
  }

  handleStacks(event: ApplyBuffEvent | ApplyBuffStackEvent | RemoveBuffEvent | RemoveBuffStackEvent | FightEndEvent, stack?: number) {
    const stackEvent = event as (typeof event & { stack: number });
    if (stackEvent.type === EventType.RemoveBuff || isNaN(stackEvent.stack)) { // NaN check if player is dead during on_finish
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

  get averageHaste() {
    let avgStacks = 0;
    this.buffStacks.forEach((elem, index) => {
      avgStacks += elem.reduce((a, b) => a + b) / this.owner.fightDuration * index;
    });
    return (avgStacks * HASTE_PER_STACK).toFixed(2);
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
                <td>{formatDuration(e.reduce((a, b) => a + b, 0) / 1000)}</td>
                <td>{formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        }
      >
      <BoringValueText label={<><SpellLink id={SPELLS.INTO_THE_FRAY_TALENT.id} /> average haste gained</>}>
      {this.averageHaste}%
        </BoringValueText>
      </Statistic>
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default IntoTheFray;
