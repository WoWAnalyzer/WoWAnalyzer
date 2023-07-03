import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.activeTimePercentage,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.875,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  showStatistic = true;

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay
          between casting spells. If you have to move, try casting{' '}
          <SpellLink spell={SPELLS.SCORCH} />{' '}
        </>,
      )
        .icon('spell_mage_altertime')
        .actual(
          <Trans id="mage.fire.suggestions.alwaysBeCasting.downtime">
            {' '}
            {formatPercentage(1 - actual)}% downtime{' '}
          </Trans>,
        )
        .recommended(
          <Trans id="mage.fire.suggestions.alwaysBeCasting.recommended">
            {' '}
            {'<'}
            {formatPercentage(1 - recommended)}% is recommended{' '}
          </Trans>,
        ),
    );
  }
}

export default AlwaysBeCasting;
