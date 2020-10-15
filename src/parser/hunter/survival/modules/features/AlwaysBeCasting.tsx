import React from 'react';

import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.activeTimePercentage,
      isLessThan: {
        minor: 0.875,
        average: 0.825,
        major: 0.775,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>Your downtime can be improved. Try to reduce the delay between casting spells. If everything is on cooldown, try and use <SpellLink id={SPELLS.RAPTOR_STRIKE.id} /> (or <SpellLink id={SPELLS.MONGOOSE_BITE_TALENT.id} /> if selected) to stay off the focus cap and do some damage.</>)
        .icon('spell_mage_altertime')
        .actual(i18n._(t('hunter.survival.suggestions.alwaysBeCasting.downtime')`${formatPercentage(1 - actual)}% downtime`))
        .recommended(`<${formatPercentage(1 - recommended)}% is recommended`));
  }
}

export default AlwaysBeCasting;
