import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.activeTimePercentage,
      isLessThan: {
        minor: 0.85,
        average: 0.8,
        major: 0.775,
      },
      style: 'percentage',
    };
  }

  suggestions(when: any) {
    when(this.suggestionThresholds).addSuggestion((suggest: any, actual: any, recommended: any) => {
      return suggest(<>Your downtime can be improved. Try to reduce the delay between casting spells. If everything is on cooldown, try and use <SpellLink id={SPELLS.COBRA_SHOT.id} /> to stay off the focus cap and do some damage.</>)
        .icon('spell_mage_altertime')
        .actual(`${formatPercentage(1 - actual)}% downtime`)
        .recommended(`<${formatPercentage(1 - recommended)}% is recommended`);
    });
  }
}

export default AlwaysBeCasting;
