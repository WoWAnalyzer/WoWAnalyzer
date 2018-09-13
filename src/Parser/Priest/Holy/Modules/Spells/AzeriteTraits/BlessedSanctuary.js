import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';

import SPELLS from 'common/SPELLS';

class BlessedSanctuary extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.BLESSED_SANCTUARY.id);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.BLESSED_SANCTUARY.id}
        value={(
          <React.Fragment>

          </React.Fragment>
        )}
        tooltip={`You have Blessed Sanctuary`}
      />
    );
  }
}

export default BlessedSanctuary;
