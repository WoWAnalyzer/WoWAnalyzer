import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { formatDuration, formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText
  from 'interface/statistics/components/BoringSpellValueText';
import CriticalStrike from 'interface/icons/CriticalStrike';
import {
  ApplyBuffEvent,
  ApplyBuffStackEvent, FightEndEvent,
  RemoveBuffEvent,
} from '../../../../core/Events';

/**
 * Barbed Shot increases your critical strike chance by 3% for 8 sec, stacking
 * up to 3 times. Example log:
 * https://www.warcraftlogs.com/reports/yg6PFb8NKz71MRWY#fight=20&type=damage-done
 */

const MAX_THRILL_STACKS = 3;
const CRIT_PER_STACK = 0.03;

class ThrillOfTheHunt extends Analyzer {

  thrillStacks: Array<Array<number>> = [];
  lastThrillStack = 0;
  lastThrillUpdate = this.owner.fight.start_time;
  currentStacks: number = 0;

  constructor(options: any) {
    super(options);
    this.active
      = this.selectedCombatant.hasTalent(SPELLS.THRILL_OF_THE_HUNT_TALENT.id);
    if (!this.active) {
      return;
    }
    this.thrillStacks = Array.from({ length: MAX_THRILL_STACKS + 1 }, x => []);
  }

  handleStacks(
    event: RemoveBuffEvent | ApplyBuffEvent | ApplyBuffStackEvent | FightEndEvent,
  ) {
    if (event.type === 'removebuff') {
      this.currentStacks = 0;
    } else if (event.type === 'applybuff') {
      this.currentStacks = 1;
    } else if (event.type === 'applybuffstack') {
      this.currentStacks = event.stack;
    } else if (event.type === 'fightend') {
      this.currentStacks = this.lastThrillStack;
    }
    this.thrillStacks[this.lastThrillStack].push(event.timestamp -
      this.lastThrillUpdate);
    this.lastThrillUpdate = event.timestamp;
    this.lastThrillStack = this.currentStacks;
  }

  get thrillOfTheHuntTimesByStacks() {
    return this.thrillStacks;
  }

  on_byPlayer_applybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.THRILL_OF_THE_HUNT_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_applybuffstack(event: ApplyBuffStackEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.THRILL_OF_THE_HUNT_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_removebuff(event: RemoveBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.THRILL_OF_THE_HUNT_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_fightend(event: FightEndEvent) {
    this.handleStacks(event);
  }

  get averageCritPercent() {
    let averageCrit = 0;
    this.thrillStacks.forEach((elem, index) => {
      averageCrit += elem.reduce((a, b) => a + b, 0) /
        this.owner.fightDuration *
        index *
        CRIT_PER_STACK;
    });
    return formatPercentage(averageCrit);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={'TALENTS'}
        tooltip={(
          <>
          </>
        )}
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
                {Object.values(this.thrillOfTheHuntTimesByStacks).map((
                  e,
                  i,
                ) => (
                  <tr key={i}>
                    <th>{i}</th>
                    <td>{formatDuration(e.reduce((a, b) => a + b, 0) /
                      1000)}</td>
                    <td>{formatPercentage(e.reduce((a, b) => a + b, 0) /
                      this.owner.fightDuration)}%
                    </td>
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
