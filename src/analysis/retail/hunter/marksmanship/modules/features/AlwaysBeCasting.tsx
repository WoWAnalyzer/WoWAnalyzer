import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
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

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your downtime can be improved. Try to Always Be Casting (ABC), this means you should try
          to reduce the delay between casting spells. If you have to move, try casting something
          like <SpellLink spell={SPELLS.STEADY_SHOT} />, since it's castable while moving and
          doesn't cost any focus. Spells like <SpellLink spell={SPELLS.RAPID_FIRE} /> and{' '}
          <SpellLink spell={SPELLS.ARCANE_SHOT} /> are also castable whilst moving and good for
          single target - for multiple targets <SpellLink spell={SPELLS.MULTISHOT_MM} /> might take
          their place.{' '}
        </>,
      )
        .icon('spell_mage_altertime')
        .actual(
          <Trans id="hunter.marksmanship.suggestions.alwaysBeCasting.downtime">
            {' '}
            {formatPercentage(1 - actual)}% downtime{' '}
          </Trans>,
        )
        .recommended(
          <Trans id="hunter.marksmanship.suggestions.alwaysBeCasting.recommended">
            {' '}
            {'<'}
            {formatPercentage(1 - recommended)}% is recommended{' '}
          </Trans>,
        ),
    );
  }
}

export default AlwaysBeCasting;
