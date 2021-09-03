import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { When } from 'parser/core/ParseResults';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD = [25235, 25213, 25222, 25218, 32546, 33076, 25308, 34866];

  suggestions(when: When) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage)
      .isGreaterThan(0.15)
      .addSuggestion((suggest, actual, recommended) =>
        suggest('Your downtime can be improved. Try to Always Be Casting (ABC).')
          .icon('spell_mage_altertime')
          .actual(
            t({
              id: 'priest.holy.suggestions.alwaysBeCasting.downtime',
              message: `${formatPercentage(actual)}% downtime`,
            }),
          )
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.05)
          .major(recommended + 0.05),
      );
  }
}

export default AlwaysBeCasting;
