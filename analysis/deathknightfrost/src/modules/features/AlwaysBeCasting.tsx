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
        minor: 0.3,
        average: 0.35,
        major: 0.45,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.downtimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="deathknight.frost.alwaysBeCasting.suggestion.suggestion">
          Your downtime can be improved. Try to Always Be Casting (ABC), reducing time away from the
          boss unless due to mechanics. If you do have to move, try casting filler spells, such as{' '}
          <SpellLink id={SPELLS.HOWLING_BLAST.id} /> or{' '}
          <SpellLink id={SPELLS.REMORSELESS_WINTER.id} />.
        </Trans>,
      )
        .icon('spell_mage_altertime')
        .actual(
          t({
            id: 'deathknight.frost.alwaysBeCasting.suggestion.actual',
            message: `${formatPercentage(actual)}% downtime`,
          }),
        )
        .recommended(
          t({
            id: 'deathknight.frost.alwaysBeCasting.suggestion.recommended',
            message: `<${formatPercentage(recommended)}% is recommended`,
          }),
        ),
    );
  }
}

export default AlwaysBeCasting;
