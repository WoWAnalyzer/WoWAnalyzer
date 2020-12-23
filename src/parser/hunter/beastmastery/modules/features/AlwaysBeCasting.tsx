import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
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
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>Your downtime can be improved. Try to reduce the delay between casting spells. If everything is on cooldown, try and use <SpellLink id={SPELLS.COBRA_SHOT.id} /> to stay off the focus cap and do some damage.</>)
      .icon('spell_mage_altertime')
      .actual(<Trans id='hunter.beastmastery.suggestions.alwaysBeCasting.downtime'> {formatPercentage(1 - actual)}% downtime </Trans>)
      .recommended(<Trans id='hunter.beastmastery.suggestions.alwaysBeCasting.recommended'> {'<'}{formatPercentage(1 - recommended)}% is recommended </Trans>));
  }
}

export default AlwaysBeCasting;
