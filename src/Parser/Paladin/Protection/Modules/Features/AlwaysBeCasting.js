import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    SPELLS.ARDENT_DEFENDER.id,
    SPELLS.AVENGER_SHIELD.id,
    SPELLS.BLESSED_HAMMER.id,
    SPELLS.CONSECRATION.id,
    SPELLS.FLASH_OF_LIGHT.id,
    SPELLS.HAMMER_OF_JUSTICE.id,
    //Talents
    SPELLS.AEGIS_OF_LIGHT_TALENT.id,
    SPELLS.BASTION_OF_LIGHT_TALENT.id,
    SPELLS.BLESSED_HAMMER_TALENT.id,
    SPELLS.BLESSING_OF_SPELLWARDING_TALENT.id,
    SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id,
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

  showStatistic = true;
  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
