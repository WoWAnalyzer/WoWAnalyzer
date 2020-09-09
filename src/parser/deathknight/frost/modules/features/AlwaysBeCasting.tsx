import React from 'react';

import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.30,
        average: 0.35,
        major: .45,
      },
      style: 'percentage',
    };
  }

  suggestions(when: any) {
    when(this.downtimeSuggestionThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<>Your downtime can be improved. Try to Always Be Casting (ABC), reducing time away from the boss unless due to mechanics.  If you do have to move, try casting filler spells, such as <SpellLink id={SPELLS.HOWLING_BLAST.id} /> or <SpellLink id={SPELLS.REMORSELESS_WINTER.id} />.</>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }
}

export default AlwaysBeCasting;
