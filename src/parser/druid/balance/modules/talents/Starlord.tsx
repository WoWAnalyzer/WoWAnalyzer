import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatDuration, formatPercentage } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Events, { EventType, ApplyBuffEvent, ApplyBuffStackEvent, RemoveBuffEvent, RemoveBuffStackEvent, FightEndEvent } from 'parser/core/Events';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';
import HasteIcon from 'interface/icons/Haste';

const MAX_STACKS = 3;
const HASTE_PER_STACK = 3;

class Starlord extends Analyzer {

  get averageHaste() {
    let avgStacks = 0;
    this.buffStacks.forEach((elem: number[], index: number) => {
      avgStacks += elem.reduce((a, b) => a + b) / this.owner.fightDuration * index;
    });
    return (avgStacks * HASTE_PER_STACK).toFixed(2);
  }

  buffStacks: number[][];
  lastStacks = 0;
  lastUpdate = this.owner.fight.start_time;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.STARLORD_TALENT.id);
    this.buffStacks = Array.from({ length: MAX_STACKS + 1 }, x => [0]);

    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.STARLORD), this.handleStacks);
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.STARLORD), this.handleStacks);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.STARLORD), this.handleStacks);
    this.addEventListener(Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.STARLORD), this.handleStacks);
    this.addEventListener(Events.fightend, this.handleStacks);
  }

  handleStacks(event: ApplyBuffEvent | ApplyBuffStackEvent | RemoveBuffEvent | RemoveBuffStackEvent | FightEndEvent, stack = null) {
    this.buffStacks[this.lastStacks].push(event.timestamp - this.lastUpdate);
    if (event.type === EventType.FightEnd) {
      return;
    }
    this.lastUpdate = event.timestamp;
    this.lastStacks = currentStacks(event);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(7)}
        size="flexible"
        dropdown={(
          <>
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
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.STARLORD_TALENT}>
          <>
            <HasteIcon /> {this.averageHaste} % <small>average haste gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Starlord;
