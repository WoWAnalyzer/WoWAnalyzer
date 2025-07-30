import { ThresholdStyle } from 'parser/core/ParseResults';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';
import spells from '../../spell-list_Monk_Mistweaver.classic';
import SPELLS from 'common/SPELLS/classic';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  HEALING_ABILITIES_ON_GCD: number[] = [
    // List of healing spells on GCD
    spells.BLACKOUT_KICK.id,
    SPELLS.JAB_1H.id,
    SPELLS.JAB_2H.id,
    spells.TIGER_PALM.id,
    spells.EXPEL_HARM.id,
    spells.RENEWING_MIST.id,
    spells.UPLIFT.id,
    spells.CHI_BURST_TALENT.id,
    spells.REVIVAL.id,
    spells.SPINNING_CRANE_KICK.id,
    spells.DETOX_1.id,
    spells.SURGING_MIST_2.id,
  ];

  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.2,
        average: 0.35,
        major: 1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default AlwaysBeCasting;
