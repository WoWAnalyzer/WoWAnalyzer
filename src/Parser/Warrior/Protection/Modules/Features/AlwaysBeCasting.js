import React from 'react';
import { formatPercentage } from 'common/format';
import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';
import SPELLS from 'common/SPELLS';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    //Rotational
    SPELLS.DEVASTATE.id,
    SPELLS.REVENGE.id,
    SPELLS.SHIELD_SLAM.id,
    SPELLS.THUNDER_CLAP.id,
    //Utility
    SPELLS.HEROIC_LEAP.id,
    SPELLS.HEROIC_THROW.id,
    SPELLS.INTERCEPT.id,

    //Talents
    SPELLS.SHOCKWAVE_TALENT.id,
    SPELLS.STORM_BOLT_TALENT.id,
    SPELLS.AVATAR_TALENT.id,
    SPELLS.IMPENDING_VICTORY_TALENT.id,
    SPELLS.RAVAGER_TALENT_PROTECTION.id,
  ];

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> Your downtime can be improved. Try to Always Be Casting (ABC)..</span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.15);
      });
  }
}

export default AlwaysBeCasting;
