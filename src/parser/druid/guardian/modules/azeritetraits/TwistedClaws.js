import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';
import { calculateAzeriteEffects } from 'common/stats';
import StatTracker from 'parser/shared/modules/StatTracker';

export function twistedClawsStats(combatant) {
  if (!combatant.hasTrait(SPELLS.TWISTED_CLAWS.id)) {
    return 0;
  }

  return combatant.traitsBySpellId[SPELLS.TWISTED_CLAWS.id]
    .reduce((total, ilevel) => total + calculateAzeriteEffects(SPELLS.TWISTED_CLAWS.id, ilevel)[0], 0);
}

class TwistedClaws extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  agility = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.TWISTED_CLAWS.id);

    if (!this.active) return;
    this.agility = twistedClawsStats(this.selectedCombatant);
    this.statTracker.add(SPELLS.TWISTED_CLAWS_BUFF.id, { agility: this.agility });
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
