import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import CriticalStrike from 'interface/icons/CriticalStrike';
import { ApplyBuffEvent, ApplyBuffStackEvent, EventType, FightEndEvent, RemoveBuffEvent } from 'parser/core/Events';

/**
 * Your maximum Focus is increased to 120, and Raptor Strike (or Mongoose bite) increases your Critical Strike by 52 for 12 sec, stacking up to 5 times.
 */
const MAX_INTUITION_STACKS = 5;

const primevalIntuitionStats = (traits: number[]) => Object.values(traits).reduce((obj: { crit: number }, rank) => {
  const [crit] = calculateAzeriteEffects(SPELLS.PRIMEVAL_INTUITION.id, rank);
  obj.crit += crit;
  return obj;
}, {
  crit: 0,
});

class PrimevalIntuition extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  crit: number = 0;
  intuitionStacks: Array<Array<number>> = [];
  lastIntuitionStack: number = 0;
  lastIntuitionUpdate: number = this.owner.fight.start_time;
  currentStacks: number = 0;

  protected statTracker!: StatTracker;

  constructor(options: any) {
    super(options);
    this.active = this.selectedCombatant.hasTrait(SPELLS.PRIMEVAL_INTUITION.id);
    if (!this.active) {
      return;
    }
    const { crit } = primevalIntuitionStats(this.selectedCombatant.traitsBySpellId[SPELLS.PRIMEVAL_INTUITION.id]);
    this.crit = crit;
    this.intuitionStacks = Array.from({ length: MAX_INTUITION_STACKS + 1 }, x => []);

    this.statTracker.add(SPELLS.PRIMEVAL_INTUITION_BUFF.id, {
      crit,
    });
  }
  get intuitionTimesByStacks() {
    return this.intuitionStacks;
  }
  get uptime() {
    return (this.selectedCombatant.getBuffUptime(SPELLS.PRIMEVAL_INTUITION_BUFF.id) / 1000).toFixed(1);
  }
  get avgCrit() {
    const avgAgi = this.intuitionStacks.reduce((sum, innerArray, outerArrayIndex) => {
      return sum + innerArray.reduce((sum, arrVal) => sum + ((arrVal * outerArrayIndex * this.crit) / this.owner.fightDuration), 0);
    }, 0);
    return avgAgi;
  }
  handleStacks(event: RemoveBuffEvent | ApplyBuffEvent | ApplyBuffStackEvent | FightEndEvent, stack = 0) {
    if (event.type === EventType.RemoveBuff) {
      this.currentStacks = 0;
    } else if (event.type === EventType.ApplyBuff) {
      this.currentStacks = 1;
    } else if (event.type === EventType.ApplyBuffStack) {
      this.currentStacks = event.stack;
    } else if (event.type === EventType.FightEnd) {
      this.currentStacks = stack;

      this.intuitionStacks[this.lastIntuitionStack].push(event.timestamp - this.lastIntuitionUpdate);
      this.lastIntuitionUpdate = event.timestamp;
      this.lastIntuitionStack = this.currentStacks;
    }
  }
  on_byPlayer_applybuff(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PRIMEVAL_INTUITION_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }
  on_byPlayer_applybuffstack(event: ApplyBuffStackEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PRIMEVAL_INTUITION_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }
  on_byPlayer_removebuff(event: RemoveBuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PRIMEVAL_INTUITION_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }
  on_fightend(event: FightEndEvent) {
    this.handleStacks(event, this.lastIntuitionStack);
  }
  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip={(
          <>
            Primeval Intuition was up for a total of {this.uptime} seconds.
          </>
        )}
        category={'AZERITE_POWERS'}
        dropdown={(
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Stacks</th>
                  <th>Time (m:s)</th>
                  <th>Time (%)</th>
                  <th>Critical Strike chance gained</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(this.intuitionTimesByStacks).map((e, i) => (
                  <tr key={i}>
                    <th>{i}</th>
                    <td>{formatDuration(e.reduce((a, b) => a + b, 0) / 1000)}</td>
                    <td>{formatPercentage(e.reduce((a, b) => a + b, 0) / this.owner.fightDuration)}%</td>
                    <td>{formatNumber(this.crit * i)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.PRIMEVAL_INTUITION}>
          <>
            <CriticalStrike /> {formatNumber(this.avgCrit)} <small>average Critical Strike chance</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PrimevalIntuition;
