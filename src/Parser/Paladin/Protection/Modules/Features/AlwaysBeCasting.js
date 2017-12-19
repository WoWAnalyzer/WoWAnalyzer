import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    SPELLS.AVENGERS_SHIELD.id,
    SPELLS.CONSECRATION_CAST.id,
    SPELLS.DIVINE_STEED.id,
    SPELLS.FLASH_OF_LIGHT.id,
    SPELLS.HAMMER_OF_JUSTICE.id,
    SPELLS.JUDGMENT_CAST.id,
    SPELLS.EYE_OF_TYR.id,
    //Talents
    SPELLS.AEGIS_OF_LIGHT_TALENT.id,
    SPELLS.BASTION_OF_LIGHT_TALENT.id,
    SPELLS.BLESSED_HAMMER_TALENT.id,
    SPELLS.BLESSING_OF_SPELLWARDING_TALENT.id,
    SPELLS.SERAPHIM_TALENT.id,
  ];

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC).</span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.2);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
