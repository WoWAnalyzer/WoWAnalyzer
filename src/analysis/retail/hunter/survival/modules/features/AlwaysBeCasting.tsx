import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.activeTimePercentage,
      isLessThan: {
        minor: 0.875,
        average: 0.825,
        major: 0.775,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    const raptorStrikeSpell = this.selectedCombatant.hasTalent(TALENTS.MONGOOSE_BITE_TALENT)
      ? TALENTS.MONGOOSE_BITE_TALENT
      : TALENTS.RAPTOR_STRIKE_TALENT;
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your downtime can be improved. Try to reduce the delay between casting spells. If
          everything is on cooldown, try and use <SpellLink spell={raptorStrikeSpell} /> to stay off
          the focus cap and do some damage.
        </>,
      )
        .icon('spell_mage_altertime')
        .actual(
          <Trans id="hunter.survival.suggestions.alwaysBeCasting.downtime">
            {' '}
            {formatPercentage(1 - actual)}% downtime{' '}
          </Trans>,
        )
        .recommended(
          <Trans id="hunter.survival.suggestions.alwaysBeCasting.recommended">
            {' '}
            {'<'}
            {formatPercentage(1 - recommended)}% is recommended{' '}
          </Trans>,
        ),
    );
  }
}

export default AlwaysBeCasting;
