import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.activeTimePercentage,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your downtime can be improved. If you need to move use{' '}
          <SpellLink spell={SPELLS.FLAME_SHOCK} />, <SpellLink spell={TALENTS.EARTH_SHOCK_TALENT} />{' '}
          or <SpellLink spell={TALENTS.FROST_SHOCK_TALENT} />
        </>,
      )
        .icon('spell_mage_altertime')
        .actual(`${formatPercentage(1 - actual)}% downtime`)
        .recommended(`<${formatPercentage(1 - recommended)}% is recommended`),
    );
  }
}

export default AlwaysBeCasting;
