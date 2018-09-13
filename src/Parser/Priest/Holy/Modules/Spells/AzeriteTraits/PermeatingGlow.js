import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';

class PermeatingGlow extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.PERMEATING_GLOW.id);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.PERMEATING_GLOW.id}
        value={(
          <React.Fragment>

          </React.Fragment>
        )}
        tooltip={`You have PermeatingGlow`}
      />
    );
  }
}

export default PermeatingGlow;
