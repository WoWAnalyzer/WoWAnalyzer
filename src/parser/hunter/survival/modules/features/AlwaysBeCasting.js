import React from 'react';

import CoreAlwaysBeCasting from 'parser/core/modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.125,
        average: 0.175,
        major: 0.225,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <React.Fragment>Your downtime can be improved. Try to reduce the delay between casting spells. If everything is on cooldown, try and use <SpellLink id={SPELLS.RAPTOR_STRIKE.id} /> (or <SpellLink id={SPELLS.MONGOOSE_BITE_TALENT.id} /> if selected) to stay off the focus cap and do some damage.
        </React.Fragment>)
        .icon('spell_mage_altertime')
        .actual(`${formatPercentage(actual)}% downtime`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`);
    });
  }
}

export default AlwaysBeCasting;
