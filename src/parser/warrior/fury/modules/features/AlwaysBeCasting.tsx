import React from 'react';

import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { t } from '@lingui/macro';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  statisticOrder = STATISTIC_ORDER.CORE(1);

  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.10,
        average: 0.15,
        major: 0.20,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {

    when(this.downtimeSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC). It's better to cast low-priority abilities such as <SpellLink id={SPELLS.WHIRLWIND_FURY_CAST.id} /> than it is to do nothing.</span>)
        .icon('spell_mage_altertime')
        .actual(t({
      id: "warrior.fury.suggestions.alwaysBeCasting.downtime",
      message: `${formatPercentage(actual)}% downtime`
    }))
        .recommended(`<${formatPercentage(recommended)}% is recommended`)
        .regular(recommended + 0.15).major(recommended + 0.2));
  }
}

export default AlwaysBeCasting;
