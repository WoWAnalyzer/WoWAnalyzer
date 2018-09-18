import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.15,
        average: 0.20,
        major: 0.225,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <React.Fragment>Your downtime can be improved. Try to reduce the delay between casting spells. If everything is on cooldown, try and use <SpellLink id={SPELLS.COBRA_SHOT.id} /> to stay off the focus cap and do some damage.
        </React.Fragment>)
        .icon('spell_mage_altertime')
        .actual(`${formatPercentage(actual)}% downtime`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`);
    });
  }
}

export default AlwaysBeCasting;
