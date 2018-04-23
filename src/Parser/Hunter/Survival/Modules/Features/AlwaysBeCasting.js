import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static dependencies = {
    ...CoreAlwaysBeCasting.dependencies,
    combatants: Combatants,
  };

  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.1,
        average: 0.15,
        major: 0.20,
      },
      style: 'percentage',
    };
  }
  statisticOrder = STATISTIC_ORDER.CORE(1);

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <React.Fragment>Your downtime can be improved. Try to reduce the delay between casting spells. If everything is on cooldown, try and use <SpellLink id={SPELLS.RAPTOR_STRIKE.id} /> or <SpellLink id={SPELLS.LACERATE.id} /> to stay off the focus cap and do some damage.
        </React.Fragment>)
        .icon('spell_mage_altertime')
        .actual(`${formatPercentage(actual)}% downtime`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`);
    });
  }
}

export default AlwaysBeCasting;
