import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'interface/others/TraitStatisticBox';

import SPELLS from 'common/SPELLS';
import { calculateAzeriteEffects } from 'common/stats';
import { formatThousands } from 'common/format';
import ItemHealingDone from 'interface/others/ItemHealingDone';

// Example Log: https://www.warcraftlogs.com/reports/nWVBjGLrDQvahH7M#fight=15&type=healing
class DeathDenied extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.DEATH_DENIED.id);

    if (this.active){
      this.ranks = this.selectedCombatant.traitRanks(SPELLS.DEATH_DENIED.id) || [];
      this.deathDeniedProcAmount = this.ranks.map((rank) => calculateAzeriteEffects(SPELLS.DEATH_DENIED.id, rank)[0]).reduce((total, bonus) => total + bonus, 0);
    }
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.DEATH_DENIED.id}
        value={(
          <>
            <ItemHealingDone amount={0} /><br />
          </>
        )}
        tooltip={`
          ${formatThousands(0)} Total Healing
        `}
      />
    );
  }
}

export default DeathDenied;
