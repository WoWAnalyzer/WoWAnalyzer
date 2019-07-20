import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox from 'interface/others/TraitStatisticBox';
import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatDuration, formatNumber, formatPercentage } from 'common/format';
import StatTracker from 'parser/shared/modules/StatTracker';

const MAX_INTUITION_STACKS = 5;

const primevalIntuitionStats = traits => Object.values(traits).reduce((obj, rank) => {
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

  crit = 0;
  intuitionStacks = [];
  lastIntuitionStack = 0;
  lastIntuitionUpdate = this.owner.fight.start_time;

  constructor(...args) {
    super(...args);
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
    this.intuitionStacks[this.lastIntuitionStack].push(event.timestamp - this.lastIntuitionUpdate);
    this.lastIntuitionUpdate = event.timestamp;
    this.lastIntuitionStack = event.stack;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PRIMEVAL_INTUITION_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PRIMEVAL_INTUITION_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PRIMEVAL_INTUITION_BUFF.id) {
      return;
    }
    this.handleStacks(event);
  }

  on_fightend(event) {
    this.handleStacks(event, this.lastIntuitionStack);
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

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.PRIMEVAL_INTUITION.id}
        value={`${formatNumber(this.avgCrit)} average Critical Strike chance`}
        tooltip={`Primeval Intuition was up for a total of ${this.uptime} seconds`}
      >
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
      </TraitStatisticBox>
    );
  }

}

export default PrimevalIntuition;
