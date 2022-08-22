import { t, Trans } from '@lingui/macro';
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
        <Trans id="deathknight.unholy.alwaysBeCasting.suggestion.suggestion">
          Your downtime can be improved. Try to Always Be Casting (ABC), reducing time away from the
          boss unless due to mechanics. If you do have to move, try casting filler spells, such as{' '}
          <SpellLink id={SPELLS.DEATH_COIL.id} /> or <SpellLink id={SPELLS.OUTBREAK.id} />.
        </Trans>,
      )
        .icon('spell_mage_altertime')
        .actual(
          t({
            id: 'deathknight.unholy.alwaysBeCasting.suggestion.actual',
            message: `${formatPercentage(actual)}% downtime`,
          }),
        )
        .recommended(
          t({
            id: 'deathknight.unholy.alwaysBeCasting.suggestion.recommended',
            message: `<${formatPercentage(recommended)}% is recommended`,
          }),
        ),
    );
  }
}

export default AlwaysBeCasting;
