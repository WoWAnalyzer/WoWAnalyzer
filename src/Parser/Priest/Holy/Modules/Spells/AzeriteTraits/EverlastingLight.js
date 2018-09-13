import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';

class EverlastingLight extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.EVERLASTING_LIGHT.id);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.EVERLASTING_LIGHT.id}
        value={(
          <React.Fragment>

          </React.Fragment>
        )}
        tooltip={`You have EverlastingLight`}
      />
    );
  }
}

export default EverlastingLight;
