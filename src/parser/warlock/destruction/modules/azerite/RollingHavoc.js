import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import EventFilter from 'parser/core/EventFilter';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';

const rollingHavocStats = traits => traits.reduce((total, rank) => {
  const [ intellect ] = calculateAzeriteEffects(SPELLS.ROLLING_HAVOC.id, rank);
  return total + intellect;
}, 0);

export const STAT_TRACKER = {
  intellect: combatant => rollingHavocStats(combatant.traitsBySpellId[SPELLS.ROLLING_HAVOC.id]),
};

const debug = false;

/*
  Rolling Havoc:
  Each time your spells duplicate to a Havoc target, gain X Intellect for 15 sec. This effect stacks.
 */
class RollingHavoc extends Analyzer {
  _lastChangeTimestamp = null;
  _currentStacks = 0;
  totalIntellect = 0;
  intellect = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.ROLLING_HAVOC.id);
    if (!this.active) {
      return;
    }
    this.intellect = rollingHavocStats(this.selectedCombatant.traitsBySpellId[SPELLS.ROLLING_HAVOC.id]);
    debug && this.log(`Total bonus from RH: ${this.intellect}`);

    // same issue as Bursting Flare
    this.addEventListener(new EventFilter('changebuffstack').by(SELECTED_PLAYER).spell(SPELLS.ROLLING_HAVOC_BUFF), this.onRollingHavocChangeBuffStack);
    this.addEventListener(new EventFilter('finished'), this.onFinished);
  }

  onRollingHavocChangeBuffStack(event) {
    debug && this.log(`RH change buffstack, last timestamp ${this._lastChangeTimestamp}, old stacks ${event.oldStacks}, new stacks ${event.newStacks}`);
    if (this._lastChangeTimestamp && event.oldStacks !== 0) {
      const uptimeOnStack = event.timestamp - this._lastChangeTimestamp;
      debug && this.log(`Uptime on old stack: ${uptimeOnStack}`);
      this.totalIntellect += event.oldStacks * this.intellect * uptimeOnStack;
      debug && this.log(`Total intellect increased to ${this.totalIntellect}`);
    }
    this._currentStacks = event.newStacks;
    this._lastChangeTimestamp = event.timestamp;
  }

  onFinished(event) {
    if (this._currentStacks !== 0) {
      const uptimeOnStack = event.timestamp - this._lastChangeTimestamp;
      debug && this.log(`Fight ended, adding rest of RH uptime on ${this._currentStacks} stacks: ${uptimeOnStack}`);
      this.totalIntellect += this._currentStacks * this.intellect * uptimeOnStack;
    }
  }

  get averageIntellect() {
    return (this.totalIntellect / this.owner.fightDuration).toFixed(0);
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
