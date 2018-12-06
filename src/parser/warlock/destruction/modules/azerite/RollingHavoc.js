import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';

const rollingHavocStats = traits => traits.reduce((total, rank) => {
  const [ intellect ] = calculateAzeriteEffects(SPELLS.ROLLING_HAVOC.id, rank);
  return total + intellect;
}, 0);

const debug = false;

/*
  Rolling Havoc:
  Each time your spells duplicate to a Havoc target, gain X Intellect for 15 sec. This effect stacks.
 */
class RollingHavoc extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  intellect = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.ROLLING_HAVOC.id);
    if (!this.active) {
      return;
    }

    this.intellect = rollingHavocStats(this.selectedCombatant.traitsBySpellId[SPELLS.ROLLING_HAVOC.id]);
    debug && this.log(`Total bonus from RH: ${this.intellect}`);

    this.statTracker.add(SPELLS.ROLLING_HAVOC_BUFF.id, {
      intellect: this.intellect,
    });
  }

  get averageIntellect() {
    const averageStacks = this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.ROLLING_HAVOC_BUFF.id) / this.owner.fightDuration;
    return (averageStacks * this.intellect).toFixed(0);
  }

  statistic() {
    const history = this.selectedCombatant.getBuffHistory(SPELLS.ROLLING_HAVOC_BUFF.id);
    const averageStacksPerCast = (history.map(buff => buff.stacks).reduce((total, current) => total + current, 0) / history.length) || 0;
    return (
      <TraitStatisticBox
        trait={SPELLS.ROLLING_HAVOC.id}
        value={`${this.averageIntellect} average Intellect`}
        tooltip={`Rolling Havoc grants ${this.intellect} Intellect per stack while active. On average you had ${averageStacksPerCast.toFixed(1)} stacks per Havoc cast (${(averageStacksPerCast * this.intellect).toFixed(0)} Intellect).`}
      />
    );
  }
}

export default RollingHavoc;
