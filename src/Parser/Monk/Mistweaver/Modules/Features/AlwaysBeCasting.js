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
  SPELLS.CHI_BURST_TALENT.id,
  SPELLS.CHI_WAVE_TALENT.id,
  SPELLS.ZEN_PULSE_TALENT.id,
  SPELLS.REFRESHING_JADE_WIND_TALENT.id,
  SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id,
];

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static dependencies = {
    ...CoreAlwaysBeCastingHealing.dependencies,
    haste: Haste,
  };

  static HEALING_ABILITIES_ON_GCD = HEALING_ABILITIES_ON_GCD;
  static ABILITIES_ON_GCD = [
    ...HEALING_ABILITIES_ON_GCD,
    SPELLS.CHI_TORPEDO_TALENT.id,
    SPELLS.BLACKOUT_KICK.id,
    SPELLS.DETOX.id,
    SPELLS.LEG_SWEEP_TALENT.id,
    SPELLS.PARALYSIS.id,
    SPELLS.ROLL.id,
    SPELLS.RISING_SUN_KICK.id,
    SPELLS.SPINNING_CRANE_KICK.id,
    SPELLS.TIGERS_LUST_TALENT.id,
    SPELLS.CRACKLING_JADE_LIGHTNING.id,
    SPELLS.TRANSCENDENCE.id,
    SPELLS.TRANSCENDENCE_TRANSFER.id,
    SPELLS.TIGER_PALM.id,
  ];

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
