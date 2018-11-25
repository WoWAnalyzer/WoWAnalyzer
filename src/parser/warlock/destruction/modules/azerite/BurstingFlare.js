import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import EventFilter from 'parser/core/EventFilter';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatPercentage } from 'common/format';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';

const burstingFlareStats = traits => traits.reduce((total, rank) => {
  const [ mastery ] = calculateAzeriteEffects(SPELLS.BURSTING_FLARE.id, rank);
  return total + mastery;
}, 0);

export const STAT_TRACKER = {
  mastery: combatant => burstingFlareStats(combatant.traitsBySpellId[SPELLS.BURSTING_FLARE.id]),
};

const debug = false;

/*
  Bursting Flare:
  Casting Conflagrate on a target affected by your Immolate increases your Mastery by X for 20 sec, stacking up to 5 times.
 */
class BurstingFlare extends Analyzer {
  _lastChangeTimestamp = null;
  _currentStacks = 0;
  totalMastery = 0;
  mastery = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.BURSTING_FLARE.id);
    if (!this.active) {
      return;
    }
    this.mastery = burstingFlareStats(this.selectedCombatant.traitsBySpellId[SPELLS.BURSTING_FLARE.id]);
    debug && this.log(`Total bonus from BF: ${this.mastery}`);

    // by no chance I was able to get it working with CombatLogParser.finished and possibly Entities.changebuffstack
    // not a clue why not but it just doesn't work (supposedly circular dependencies but the same code (at least with finished) works elsewhere, not here), this does
    this.addEventListener(new EventFilter('changebuffstack').by(SELECTED_PLAYER).spell(SPELLS.BURSTING_FLARE_BUFF), this.onBurstingFlareChangeBuffStack);
    this.addEventListener(new EventFilter('finished'), this.onFinished);
  }

  onBurstingFlareChangeBuffStack(event) {
    debug && this.log(`BF change buffstack, last timestamp ${this._lastChangeTimestamp}, old stacks ${event.oldStacks}, new stacks ${event.newStacks}`);
    if (this._lastChangeTimestamp && event.oldStacks !== 0) {
      const uptimeOnStack = event.timestamp - this._lastChangeTimestamp;
      debug && this.log(`Uptime on old stack: ${uptimeOnStack}`);
      this.totalMastery += event.oldStacks * this.mastery * uptimeOnStack;
      debug && this.log(`Total mastery increased to ${this.totalMastery}`);
    }
    this._currentStacks = event.newStacks;
    this._lastChangeTimestamp = event.timestamp;
  }

  onFinished(event) {
    if (this._currentStacks !== 0) {
      const uptimeOnStack = event.timestamp - this._lastChangeTimestamp;
      debug && this.log(`Fight ended, adding rest of BF uptime on ${this._currentStacks} stacks: ${uptimeOnStack}`);
      this.totalMastery += this._currentStacks * this.mastery * uptimeOnStack;
    }
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.BURSTING_FLARE_BUFF.id) / this.owner.fightDuration;
  }

  get averageMastery() {
    return (this.totalMastery / this.owner.fightDuration).toFixed(0);
  }

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.BURSTING_FLARE.id}
        value={`${this.averageMastery} average Mastery`}
        tooltip={`Bursting Flare grants ${this.mastery} Mastery per stack (${5 * this.mastery} Mastery at 5 stacks) while active. You had ${formatPercentage(this.uptime)} % uptime on the buff.`}
      />
    );
  }
}

export default BurstingFlare;
