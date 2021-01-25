import React from 'react';

import { formatPercentage } from 'common/format';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { Trans } from '@lingui/macro';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.activeTimePercentage,
      isLessThan: {
        minor: 0.90,
        average: 0.85,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<Trans id="shared.suggestions.alwaysBeCasting.suggestion">Your downtime can be improved. Try to Always Be Casting (ABC), avoid delays between casting spells and cast instant spells when you have to move.</Trans>)
    .icon('spell_mage_altertime')
    .actual(<Trans id="shared.suggestions.alwaysBeCasting.downtime">{formatPercentage(actual)}% downtime</Trans>)
    .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }
}

export default AlwaysBeCasting;


