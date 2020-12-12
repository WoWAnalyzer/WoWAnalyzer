import React from 'react';

import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import { t } from '@lingui/macro';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: 'percentage',
    };
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Even if you have to move, try casting something instant. Make good use of your <SpellLink id={SPELLS.DEMONIC_CIRCLE.id} /> or <SpellLink id={SPELLS.BURNING_RUSH_TALENT.id} /> when you can.</>)
        .icon('spell_mage_altertime')
        .actual(t({
      id: "warlock.demonology.suggestions.alwaysBeCasting.downtime",
      message: `${formatPercentage(actual)}% downtime`
    }))
        .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }
}

export default AlwaysBeCasting;
