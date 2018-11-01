import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

const unstableCatalystStats = traits => Object.values(traits).reduce((total, rank) => {
  const [int] = calculateAzeriteEffects(SPELLS.UNSTABLE_CATALYST.id, rank);
  return total + int;
}, 0);

export const STAT_TRACKER = {
  intellect: combatant => unstableCatalystStats(combatant.traitsBySpellId[SPELLS.UNSTABLE_CATALYST.id]),
};

/**
 * Unstable Catalyst:
 * Your spells and abilities have a chance to leak Azerite on the ground around you. 
 * Standing in the Azerite increases your primary stat by 177 for 8 sec.
 */
class UnstableCatalyst extends Analyzer {
  int = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.UNSTABLE_CATALYST.id);
    if (!this.active) {
      return;
    }

    this.int = unstableCatalystStats(this.selectedCombatant.traitsBySpellId[SPELLS.UNSTABLE_CATALYST.id]);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.UNSTABLE_CATALYST_BUFF.id) / this.owner.fightDuration;
  }

  get averageint() {
    return (this.int * this.uptime).toFixed(0);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.UNSTABLE_CATALYST.id}
        value={`${this.averageint} average ${this.selectedCombatant.spec.primaryStat}`}
        tooltip={`
          ${SPELLS.UNSTABLE_CATALYST.name} grants <b>${this.int} ${this.selectedCombatant.spec.primaryStat}</b> while active.<br/>
          You had an uptime of ${formatPercentage(this.uptime)}%.
        `}
      />
    );
  }
}

export default UnstableCatalyst;
