import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import Statistic from 'interface/statistics/Statistic';
import CriticalStrike from 'interface/icons/CriticalStrike';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent, EventType, FightEndEvent, RemoveBuffEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { currentStacks } from 'parser/shared/modules/helpers/Stacks';

/**
 * Your maximum Focus is increased to 120, and Raptor Strike (or Mongoose bite) increases your Critical Strike by 52 for 12 sec, stacking up to 5 times.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/NTvPJdrFgYchAX1R#fight=6&type=auras&source=27&ability=288573
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

    options.statTracker.add(SPELLS.PRIMEVAL_INTUITION_BUFF.id, {
      crit: this.crit,
    });
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.PRIMEVAL_INTUITION_BUFF),(event: ApplyBuffEvent) => this.handleStacks(event));
    this.addEventListener(Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.PRIMEVAL_INTUITION_BUFF), (event: ApplyBuffStackEvent) => this.handleStacks(event));
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.PRIMEVAL_INTUITION_BUFF), (event: RemoveBuffEvent) => this.handleStacks(event));
    this.addEventListener(Events.fightend, (event: FightEndEvent) => this.handleStacks(event));
  }

  get intuitionTimesByStacks() {
    return this.intuitionStacks;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.PRIMEVAL_INTUITION_BUFF.id) / 1000;
  }

  get avgCrit() {
    const avgCrit = this.intuitionStacks.reduce((sum, innerArray, outerArrayIndex) => {
      return sum + innerArray.reduce((sum, arrVal) => sum + ((arrVal * outerArrayIndex * this.crit) / this.owner.fightDuration), 0);
    }, 0);
    return avgCrit;
  }

  handleStacks(event: RemoveBuffEvent | ApplyBuffEvent | ApplyBuffStackEvent | FightEndEvent) {
    this.intuitionStacks[this.lastIntuitionStack].push(event.timestamp - this.lastIntuitionUpdate);
    if (event.type === EventType.FightEnd) {
      return;
    }
    this.lastIntuitionUpdate = event.timestamp;
    this.lastIntuitionStack = currentStacks(event);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip={(
          <>
            Primeval Intuition was up for a total of {formatNumber(this.uptime)} seconds.
          </>
        )}
        category={STATISTIC_CATEGORY.AZERITE_POWERS}
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
                    <td>{formatDuration(e.reduce((a: number, b: number) => a + b, 0) / 1000)}</td>
                    <td>{formatPercentage(e.reduce((a: number, b: number) => a + b, 0) / this.owner.fightDuration)}%</td>
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
