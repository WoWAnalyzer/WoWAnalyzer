import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';

class PrayerfulLitany extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.PRAYERFUL_LITANY.id);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.PRAYERFUL_LITANY.id}
        value={(
          <React.Fragment>

          </React.Fragment>
        )}
        tooltip={`You have PrayerfulLitany`}
      />
    );
  }
}

export default PrayerfulLitany;
