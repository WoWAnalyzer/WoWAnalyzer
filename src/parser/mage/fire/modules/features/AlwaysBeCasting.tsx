import React from 'react';

import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import { Trans } from '@lingui/macro';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.activeTimePercentage,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.875,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  showStatistic = true;

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. If you have to move, try casting <SpellLink id={SPELLS.SCORCH.id} /> </>)
      .icon('spell_mage_altertime')
      .actual(<Trans id='mage.fire.suggestions.alwaysBeCasting.downtime'> {formatPercentage(1 - actual)}% downtime </Trans>)
      .recommended(<Trans id='mage.fire.suggestions.alwaysBeCasting.recommended'> {'<'}{formatPercentage(1 - recommended)}% is recommended </Trans>));
  }
}

export default AlwaysBeCasting;
