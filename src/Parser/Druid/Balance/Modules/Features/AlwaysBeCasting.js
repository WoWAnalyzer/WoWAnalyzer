import React from 'react';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    // Moonkin:
    SPELLS.MOONFIRE.id,
    SPELLS.SUNFIRE_CAST.id,
    SPELLS.STARSURGE_MOONKIN.id,
    SPELLS.STARFALL_CAST.id,
    SPELLS.LUNAR_STRIKE.id,
    SPELLS.SOLAR_WRATH_MOONKIN.id,
    SPELLS.NEW_MOON.id,
    SPELLS.HALF_MOON.id,
    SPELLS.FULL_MOON.id,
    SPELLS.MOONKIN_FORM.id,
    SPELLS.DISPLACER_BEAST_TALENT.id,
    SPELLS.BEAR_FORM.id,

    // Talents
    SPELLS.TYPHOON_TALENT.id,
    SPELLS.MASS_ENTANGLEMENT_TALENT.id,
    SPELLS.FORCE_OF_NATURE_TALENT.id,
  ];

  static STATIC_GCD_ABILITIES = {
    ...CoreAlwaysBeCasting.STATIC_GCD_ABILITIES,
    // Shapeshifts
    [SPELLS.MOONKIN_FORM.id]: 1.5,
    [SPELLS.DISPLACER_BEAST_TALENT.id]: 1.5,
    [SPELLS.BEAR_FORM.id]: 1.5,
  };

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.02)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> Your downtime can be improved. Try to Always Be Casting (ABC)...</span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`${Math.round(formatPercentage(recommended))}% or less is recommended`)
          .regular(recommended + 0.03).major(recommended + 0.08);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
