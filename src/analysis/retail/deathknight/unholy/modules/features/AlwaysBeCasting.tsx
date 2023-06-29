import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.1,
        average: 0.15,
        major: 0.2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.downtimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          Your downtime can be improved. Try to Always Be Casting (ABC), reducing time away from the
          boss unless due to mechanics. If you do have to move, try casting filler spells, such as{' '}
          <SpellLink spell={SPELLS.DEATH_COIL} /> or <SpellLink spell={SPELLS.OUTBREAK} />.
        </span>,
      )
        .icon('spell_mage_altertime')
        .actual(`${formatPercentage(actual)}% downtime`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default AlwaysBeCasting;
