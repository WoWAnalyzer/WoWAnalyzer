import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { TIERS } from 'game/TIERS';
import { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  HEALING_ABILITIES_ON_GCD: number[] = [
    TALENTS_EVOKER.SPIRITBLOOM_TALENT.id,
    TALENTS_EVOKER.REVERSION_TALENT.id,
    TALENTS_EVOKER.TEMPORAL_ANOMALY_TALENT.id,
    TALENTS_EVOKER.EMERALD_COMMUNION_TALENT.id,
    TALENTS_EVOKER.DREAM_BREATH_TALENT.id,
    TALENTS_EVOKER.VERDANT_EMBRACE_TALENT.id,
    SPELLS.EMERALD_BLOSSOM_CAST.id,
    TALENTS_EVOKER.TIME_DILATION_TALENT.id,
    SPELLS.LIVING_FLAME_CAST.id,
    TALENTS_EVOKER.REWIND_TALENT.id,
    TALENTS_EVOKER.DREAM_FLIGHT_TALENT.id,
    TALENTS_EVOKER.ECHO_TALENT.id,
    TALENTS_EVOKER.DREAM_FLIGHT_TALENT.id,
    SPELLS.DREAM_BREATH_FONT.id,
    SPELLS.SPIRITBLOOM_FONT.id,
    TALENTS_EVOKER.STASIS_TALENT.id,
  ];
  constructor(options: Options) {
    super(options);
    if (this.selectedCombatant.hasTalent(TALENTS_EVOKER.ENERGY_LOOP_TALENT)) {
      this.HEALING_ABILITIES_ON_GCD.push(SPELLS.DISINTEGRATE.id);
    }
    if (
      this.selectedCombatant.has2PieceByTier(TIERS.T29) ||
      this.selectedCombatant.hasTalent(TALENTS_EVOKER.LIFE_GIVERS_FLAME_TALENT)
    ) {
      this.HEALING_ABILITIES_ON_GCD.push(SPELLS.FIRE_BREATH.id);
    }
  }

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
    when(this.nonHealingTimePercentage)
      .isGreaterThan(this.nonHealingTimeSuggestionThresholds.isGreaterThan.minor)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          'Your non healing time can be improved. Try to reduce the delay between casting spells and try to continue healing when you have to move.',
        )
          .icon('petbattle_health-down')
          .actual(
            defineMessage({
              id: 'evoker.preservation.suggestions.alwaysBeCasting.nonHealing',
              message: `${formatPercentage(actual)}% non healing time`,
            }),
          )
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(this.nonHealingTimeSuggestionThresholds.isGreaterThan.average)
          .major(this.nonHealingTimeSuggestionThresholds.isGreaterThan.major),
      );
    when(this.downtimePercentage)
      .isGreaterThan(this.downtimeSuggestionThresholds.isGreaterThan.minor)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          "Your downtime can be improved. Try to Always Be Casting (ABC); try to reduce the delay between casting spells and when you're not healing try to contribute some damage.",
        )
          .icon('spell_mage_altertime')
          .actual(
            defineMessage({
              id: 'evoker.preservation.suggestions.alwaysBeCasting.downtime',
              message: `${formatPercentage(actual)}% downtime`,
            }),
          )
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(this.downtimeSuggestionThresholds.isGreaterThan.average)
          .major(this.downtimeSuggestionThresholds.isGreaterThan.major),
      );
  }
}

export default AlwaysBeCasting;
