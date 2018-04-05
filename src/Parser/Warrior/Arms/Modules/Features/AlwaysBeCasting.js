import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    // Rotational
    SPELLS.COLOSSUS_SMASH.id,
    SPELLS.MORTAL_STRIKE.id,
    SPELLS.EXECUTE.id,
    SPELLS.SLAM.id,
    SPELLS.CLEAVE.id,
    SPELLS.WHIRLWIND.id,
    SPELLS.WARBREAKER.id,
    // Utility
    SPELLS.HEROIC_THROW.id,
    // Talents
    SPELLS.SHOCKWAVE_TALENT.id,
    SPELLS.STORM_BOLT_TALENT.id,
    SPELLS.AVATAR_TALENT.id,
  ];

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells.</span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.2);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
