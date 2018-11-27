import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatPercentage } from 'common/format';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';

const accelerantStats = traits => traits.reduce((total, rank) => {
  const [ haste ] = calculateAzeriteEffects(SPELLS.ACCELERANT.id, rank);
  return total + haste;
}, 0);

export const STAT_TRACKER = {
  haste: combatant => accelerantStats(combatant.traitsBySpellId[SPELLS.ACCELERANT.id]),
};

const debug = false;

/*
  Accelerant:
  When your Rain of Fire damages 3 or more targets, gain X Haste for 12 sec.
 */
class Accelerant extends Analyzer {
  haste = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.ACCELERANT.id);
    if (!this.active) {
      return;
    }
    this.haste = accelerantStats(this.selectedCombatant.traitsBySpellId[SPELLS.ACCELERANT.id]);
    debug && this.log(`Total bonus from Accelerant: ${this.haste}`);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ACCELERANT_BUFF.id) / this.owner.fightDuration;
  }

  get averageHaste() {
    return (this.uptime * this.haste).toFixed(0);
  }

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.ACCELERANT.id}
        value={`${this.averageHaste} average Haste`}
        tooltip={`Accelerant grants ${this.haste} Haste while active. You had ${formatPercentage(this.uptime)} % uptime on the buff.`}
      />
    );
  }
}

export default Accelerant;
