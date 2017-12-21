// import SPELLS from 'common/SPELLS';
// import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    // TODO: Provide a list of spell IDs here that are on the GCD. Only the ID (number) should be provided. This list must be complete or the shown downtime will be off. Don't include any spells that are not on the GCD.
    // Another reason your downtime number might be off is if your spec has a spec/class specific Haste buff that is not implemented. You should add this to the `HASTE_BUFFS` array in `Parser/Core/Modules/Haste.js`.
  ];

  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.05,
        average: 0.2,
        major: 0.3,
      },
      style: 'percentage',
    };
  }
  suggestions(when) {
    when(this.suggestionThresholds.actual).isGreaterThan(this.suggestionThresholds.isGreaterThan.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your downtime can be improved. Try to reduce your downtime, for example by reducing the delay between casting spells and using instant cast spells while you have to move.')
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(this.suggestionThresholds.isGreaterThan.average).major(this.suggestionThresholds.isGreaterThan.major);
      });
  }
}

export default AlwaysBeCasting;
