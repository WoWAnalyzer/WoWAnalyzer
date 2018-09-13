import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import TraitStatisticBox, { STATISTIC_ORDER } from 'Interface/Others/TraitStatisticBox';

class TwistMagic extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.TWIST_MAGIC.id);
  }

  statistic() {
    return (
      <TraitStatisticBox
        position={STATISTIC_ORDER.OPTIONAL()}
        trait={SPELLS.TWIST_MAGIC.id}
        value={(
          <React.Fragment>

          </React.Fragment>
        )}
        tooltip={`You have TwistMagic`}
      />
    );
  }
}

export default TwistMagic;
