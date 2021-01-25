import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import React from 'react';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.activeTimePercentage,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>Your downtime can be improved. If you need to move use <SpellLink id={SPELLS.FLAME_SHOCK.id} />, <SpellLink id={SPELLS.EARTH_SHOCK.id} /> or <SpellLink id={SPELLS.FROST_SHOCK.id} /></>)
      .icon('spell_mage_altertime')
      .actual(`${formatPercentage(1 - actual)}% downtime`)
      .recommended(`<${formatPercentage(1 - recommended)}% is recommended`));
  }
}

export default AlwaysBeCasting;
