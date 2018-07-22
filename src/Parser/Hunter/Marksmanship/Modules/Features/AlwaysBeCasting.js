import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.05,
        average: 0.075,
        major: 0.1,
      },
      style: 'percentage',
    };
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Your downtime can be improved. Try to Always Be Casting (ABC), this means you should try to reduce the delay between casting spells. If you have to move, try casting something like <SpellLink id={SPELLS.STEADY_SHOT.id} />, since it's castable while moving and doesn't cost any focus. Spells like <SpellLink id={SPELLS.RAPID_FIRE_BUFF.id} /> and <SpellLink id={SPELLS.ARCANE_SHOT.id} /> are also castable whilst moving and good for single target - for multiple targets <SpellLink id={SPELLS.MULTISHOT_MM.id} /> might take their place. </React.Fragment>)
        .icon('spell_mage_altertime')
        .actual(`${formatPercentage(actual)}% downtime`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`);
    });
  }
}

export default AlwaysBeCasting;
