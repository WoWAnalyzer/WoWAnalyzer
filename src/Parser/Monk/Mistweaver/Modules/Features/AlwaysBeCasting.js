import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import CoreAlwaysBeCastingHealing from 'Parser/Core/Modules/AlwaysBeCastingHealing';
import Haste from 'Parser/Core/Modules/Haste';

const HEALING_ABILITIES_ON_GCD = [
  SPELLS.EFFUSE.id,
  SPELLS.ENVELOPING_MISTS.id,
  SPELLS.ESSENCE_FONT.id,
  SPELLS.RENEWING_MIST.id,
  SPELLS.VIVIFY.id,
  SPELLS.REVIVAL.id,
  SPELLS.SHEILUNS_GIFT.id,
  SPELLS.CHI_BURST_TALENT.id,
  SPELLS.CHI_WAVE_TALENT.id,
  SPELLS.REFRESHING_JADE_WIND_TALENT.id,
];

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static dependencies = {
    ...CoreAlwaysBeCastingHealing.dependencies,
    haste: Haste,
  };

  static HEALING_ABILITIES_ON_GCD = HEALING_ABILITIES_ON_GCD;

  get nonHealingTimeSuggestionThresholds() {
    return {
      actual: this.nonHealingTimePercentage,
      isGreaterThan: {
        minor: 0.4,
        average: 0.5,
        major: 0.55,
      },
      style: 'percentage',
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
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.nonHealingTimePercentage).isGreaterThan(this.nonHealingTimeSuggestionThresholds.isGreaterThan.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your non healing time can be improved. Try to reduce the delay between casting spells and try to continue healing when you have to move.')
          .icon('petbattle_health-down')
          .actual(`${formatPercentage(actual)}% non healing time`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(this.nonHealingTimeSuggestionThresholds.isGreaterThan.average).major(this.nonHealingTimeSuggestionThresholds.isGreaterThan.major);
      });
    when(this.downtimePercentage).isGreaterThan(this.downtimeSuggestionThresholds.isGreaterThan.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your downtime can be improved. Try to Always Be Casting (ABC); try to reduce the delay between casting spells and when you\'re not healing try to contribute some damage.')
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(this.downtimeSuggestionThresholds.isGreaterThan.average).major(this.downtimeSuggestionThresholds.isGreaterThan.major);
      });
  }
}

export default AlwaysBeCasting;
