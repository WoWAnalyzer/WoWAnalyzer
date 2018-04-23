import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static dependencies = {
    ...CoreAlwaysBeCasting.dependencies,
    combatants: Combatants,
  };

  get suggestionThresholds() {
    if (this.combatants.selected.hasTalent(SPELLS.SIDEWINDERS_TALENT.id)) {
      return {
        actual: this.downtimePercentage,
        isGreaterThan: {
          minor: 0.3,
          average: 0.35,
          major: 0.4,
        },
        style: 'percentage',
      };
    } else {
      return {
        actual: this.downtimePercentage,
        isGreaterThan: {
          minor: 0.02,
          average: 0.04,
          major: 0.06,
        },
        style: 'percentage',
      };
    }
  }
  statisticOrder = STATISTIC_ORDER.CORE(1);

  suggestions(when) {
    //When playing with sidewinders your downtime is significantly different than when you play without, this is due to losing all instant casts
    if (this.combatants.selected.hasTalent(SPELLS.SIDEWINDERS_TALENT.id)) {
      when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Your downtime can be improved. Try and minimise the time spent standing around doing nothing, even though you are playing with <SpellLink id={SPELLS.SIDEWINDERS_TALENT.id} />.</React.Fragment>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
    } else {
      when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Your downtime can be improved. Try to Always Be Casting (ABC), this means you should try to reduce the delay between casting spells. Even if you have to move, try casting something instant like <SpellLink id={SPELLS.ARCANE_SHOT.id} /> for single target or <SpellLink id={SPELLS.MULTISHOT.id} /> for multiple targets.</React.Fragment>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
    }
  }
}

export default AlwaysBeCasting;
