import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatPercentage } from 'common/format';

import TraitStatisticBox from 'interface/others/TraitStatisticBox';

const wrackingBrillianceStats = traits => traits.reduce((total, rank) => {
  const [ intellect ] = calculateAzeriteEffects(SPELLS.WRACKING_BRILLIANCE.id, rank);
  return total + intellect;
}, 0);

export const STAT_TRACKER = {
  intellect: combatant => wrackingBrillianceStats(combatant.traitsBySpellId[SPELLS.WRACKING_BRILLIANCE.id]),
};

const debug = false;

/*
  Wracking Brilliance:
    Every other Soul Shard your Agony generates also increases your Intellect by X for 6 sec.
 */
class WrackingBrilliance extends Analyzer {
  intellect = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.WRACKING_BRILLIANCE.id);
    if (!this.active) {
      return;
    }
    this.intellect = wrackingBrillianceStats(this.selectedCombatant.traitsBySpellId[SPELLS.WRACKING_BRILLIANCE.id]);
    debug && this.log(`Total bonus from WB: ${this.intellect}`);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.WRACKING_BRILLIANCE_BUFF.id) / this.owner.fightDuration;
  }

  get averageIntellect() {
    return (this.uptime * this.intellect).toFixed(0);
  }

  statistic() {
    return (
      <TraitStatisticBox
        trait={SPELLS.WRACKING_BRILLIANCE.id}
        value={`${this.averageIntellect} average Intellect`}
        tooltip={`Wracking Brilliance grants ${this.intellect} Intellect while active. You had ${formatPercentage(this.uptime)} % uptime on the buff.`}
      />
    );
  }
}

export default WrackingBrilliance;
