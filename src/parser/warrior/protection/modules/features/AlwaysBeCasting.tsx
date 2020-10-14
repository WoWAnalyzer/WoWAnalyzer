import React from 'react';
import { formatPercentage } from 'common/format';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { When } from 'parser/core/ParseResults';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  suggestions(when: When) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => suggest(<span> Your downtime can be improved. Try to Always Be Casting (ABC)..</span>)
          .icon('spell_mage_altertime')
          .actual(i18n._(t('warrior.protection.suggestions.alwaysBeCasting.downtime')`${formatPercentage(actual)}% downtime`))
          .recommended(`${Math.round(Number(formatPercentage(recommended)))}% is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.15));
  }
}

export default AlwaysBeCasting;
