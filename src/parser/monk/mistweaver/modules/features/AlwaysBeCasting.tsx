import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD: number[] = [
    SPELLS.ENVELOPING_MIST.id,
    SPELLS.ESSENCE_FONT.id,
    SPELLS.RENEWING_MIST.id,
    SPELLS.VIVIFY.id,
    SPELLS.REVIVAL.id,
    SPELLS.CHI_BURST_TALENT.id,
    SPELLS.CHI_WAVE_TALENT.id,
    SPELLS.REFRESHING_JADE_WIND_TALENT.id,
    SPELLS.SOOTHING_MIST.id,
    SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id,
    SPELLS.EXPEL_HARM.id,
    SPELLS.INVOKE_YULON_THE_JADE_SERPENT.id,
  ];

  get nonHealingTimeSuggestionThresholds() {
    return {
      actual: this.nonHealingTimePercentage,
      isGreaterThan: {
        minor: 0.4,
        average: 0.5,
        major: 0.55,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.4,
        average: 0.55,
        major: 1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.nonHealingTimePercentage).isGreaterThan(this.nonHealingTimeSuggestionThresholds.isGreaterThan.minor)
      .addSuggestion((suggest, actual, recommended) => suggest('Your non healing time can be improved. Try to reduce the delay between casting spells and try to continue healing when you have to move.')
          .icon('petbattle_health-down')
          .actual(i18n._(t('monk.mistweaver.suggestions.alwaysBeCasting.nonHealing')`${formatPercentage(actual)}% non healing time`))
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(this.nonHealingTimeSuggestionThresholds.isGreaterThan.average).major(this.nonHealingTimeSuggestionThresholds.isGreaterThan.major));
    when(this.downtimePercentage).isGreaterThan(this.downtimeSuggestionThresholds.isGreaterThan.minor)
      .addSuggestion((suggest, actual, recommended) => suggest('Your downtime can be improved. Try to Always Be Casting (ABC); try to reduce the delay between casting spells and when you\'re not healing try to contribute some damage.')
          .icon('spell_mage_altertime')
          .actual(i18n._(t('monk.mistweaver.suggestions.alwaysBeCasting.downtime')`${formatPercentage(actual)}% downtime`))
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(this.downtimeSuggestionThresholds.isGreaterThan.average).major(this.downtimeSuggestionThresholds.isGreaterThan.major));
  }
}

export default AlwaysBeCasting;
