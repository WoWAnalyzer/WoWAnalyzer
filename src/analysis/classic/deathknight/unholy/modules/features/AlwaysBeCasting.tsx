import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/classic/deathknight';
import { SpellLink } from 'interface';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
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
          Your downtime can be improved. Try to reduce time away from the boss. If you have to move,
          try casting filler spells, such as <SpellLink id={SPELLS.DEATH_COIL_DK} />.
        </span>,
      )
        .icon('spell_mage_altertime')
        .actual(
          t({
            id: 'deathknight.unholy.suggestions.alwaysBeCasting',
            message: `${formatPercentage(actual)}% downtime`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default AlwaysBeCasting;
