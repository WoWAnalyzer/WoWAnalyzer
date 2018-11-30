import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { calculateAzeriteEffects } from 'common/stats';

export function twistedClawsStats(combatant) {
  if (!combatant.hasTrait(SPELLS.TWISTED_CLAWS.id)) {
    return 0;
  }

  return combatant.traitsBySpellId[SPELLS.TWISTED_CLAWS.id]
    .reduce((total, ilevel) => total + calculateAzeriteEffects(SPELLS.TWISTED_CLAWS.id, ilevel)[0], 0);
}

export const STAT_TRACKER = {
  agility: twistedClawsStats,
};

class TwistedClaws extends Analyzer {
  agility = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.TWISTED_CLAWS.id);
    this.agility = twistedClawsStats(this.selectedCombatant);
  }

  get averageStacks() {
    return this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.TWISTED_CLAWS_BUFF.id) / this.owner.fightDuration;
  }

  get averageAgility() {
    return this.averageStacks * this.agility;
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.TWISTED_CLAWS.id}
        value={(
          <>
            Average {this.averageStacks.toFixed(2)} stacks ({this.averageAgility.toFixed(0)} Agility)
          </>
        )}
      />
    );
  }
}

export default TwistedClaws;
