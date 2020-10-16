import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { formatPercentage } from 'common/format';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class AlwaysBeCasting extends CoreAlwaysBeCasting {

  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.15,
        average: 0.20,
        major: 0.25,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.downtimeSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest('Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells.')
          .icon('spell_mage_altertime')
          .actual(i18n._(t('warrior.arms.suggestions.alwaysBeCasting.downtime')`${formatPercentage(actual)}% downtime`))
          .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }
}

export default AlwaysBeCasting;
