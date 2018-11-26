import React from 'react';

import Analyzer from 'parser/core/Analyzer';

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
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.BURSTING_FLARE_BUFF.id) / this.owner.fightDuration;
  }

  get averageMastery() {
    const averageStacks = this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.BURSTING_FLARE_BUFF.id) / this.owner.fightDuration;
    return (averageStacks * this.mastery).toFixed(0);
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
