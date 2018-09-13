import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';

class SacredFlame extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.SACRED_FLAME.id);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.SACRED_FLAME.id}
        value={(
          <React.Fragment>

          </React.Fragment>
        )}
        tooltip={`You have SacredFlame`}
      />
    );
  }
}

export default SacredFlame;
