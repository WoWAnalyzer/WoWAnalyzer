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
        minor: 0.9,
        average: 0.85,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your downtime can be improved. Try to reduce the delay between casting spells. If
          everything is on cooldown, try and use <SpellLink id={TALENTS.COBRA_SHOT_TALENT.id} /> to
          stay off the focus cap and do some damage.
        </>,
      )
        .icon('spell_mage_altertime')
        .actual(<> {formatPercentage(1 - actual)}% downtime </>)
        .recommended(
          <>
            {' '}
            {'<'}
            {formatPercentage(1 - recommended)}% is recommended{' '}
          </>,
        ),
    );
  }
}

export default AlwaysBeCasting;
