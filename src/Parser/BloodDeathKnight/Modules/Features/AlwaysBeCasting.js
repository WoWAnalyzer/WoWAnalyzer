import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    SPELLS.CONSUMPTION.id,
    SPELLS.DEATH_AND_DECAY.id,
    SPELLS.BLOOD_BOIL.id,
    SPELLS.HEART_STRIKE.id,
    SPELLS.MARROWREND.id,
    SPELLS.DEATH_STRIKE.id,
    SPELLS.DEATHS_CARESS.id,
    SPELLS.BLOODDRINKER_TALENT.id,
    // CDS
    SPELLS.ICEBOUND_FORTITUDE.id,
    SPELLS.DANCING_RUNE_WEAPON.id,
    SPELLS.VAMPIRIC_BLOOD.id,
    SPELLS.ANTI_MAGIC_SHELL.id,
    SPELLS.BLOOD_MIRROR_TALENT.id,
    // CC
    SPELLS.ASPHYXIATE_TALENT.id,
    SPELLS.DARK_COMMAND.id,
    SPELLS.DEATH_GRIP.id,
    SPELLS.MIND_FREEZE.id,
    SPELLS.GOREFIENDS_GRASP.id,
    // Movement
    SPELLS.WRAITH_WALK.id,
    // MISC
    SPELLS.CONTROL_UNDEAD.id,
    SPELLS.DEATH_GATE.id,
    SPELLS.RAISE_ALLY.id,
    SPELLS.BONESTORM_TALENT.id,
  ];

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Even if you have to move, try casting something instant - maybe refresh your dots or replenish your mana with <SpellLink id={SPELLS.LIFE_TAP.id} /></span>)
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
