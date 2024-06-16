import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { TIERS } from 'game/TIERS';
import { Options } from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
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
      this.selectedCombatant.has2PieceByTier(TIERS.DF1) ||
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
}

export default AlwaysBeCasting;
