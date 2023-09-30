import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic';
import { SpellLink } from 'interface';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.3,
        average: 0.35,
        major: 0.4,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.downtimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          Your downtime can be improved by staying within melee range of the boss. If you are far
          out of range, use <SpellLink spell={SPELLS.INTERCEPT} /> to return to the boss. Also try
          to prioritize using your <SpellLink spell={SPELLS.SLAM_PROC} />s and weaving
          <SpellLink spell={SPELLS.HEROIC_THROW} /> into your rotation if no other GCD is available
          or would be delayed by it. Also use it should you ever need to leave melee range and have
          no
          <SpellLink spell={SPELLS.INTERCEPT} /> available.
        </span>,
      )
        .icon('spell_mage_altertime')
        .actual(
          defineMessage({
            id: 'shared.suggestions.alwaysBeCasting.downtime',
            message: `${formatPercentage(actual)}% downtime`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default AlwaysBeCasting;
