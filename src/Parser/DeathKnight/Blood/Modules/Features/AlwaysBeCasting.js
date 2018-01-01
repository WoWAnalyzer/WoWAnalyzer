import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    SPELLS.CONSUMPTION.id,
    SPELLS.DEATH_AND_DECAY.id,
    SPELLS.BLOOD_BOIL.id,
    SPELLS.HEART_STRIKE.id,
    SPELLS.MARROWREND.id,
    SPELLS.DEATH_STRIKE.id,
    SPELLS.DEATHS_CARESS.id,
    // CDS
    SPELLS.ICEBOUND_FORTITUDE.id,
    SPELLS.DANCING_RUNE_WEAPON.id,
    SPELLS.VAMPIRIC_BLOOD.id,
    SPELLS.ANTI_MAGIC_SHELL.id,
    // CC
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
    //Talents
    SPELLS.BONESTORM_TALENT.id,
    SPELLS.ASPHYXIATE_TALENT.id,
    SPELLS.BLOODDRINKER_TALENT.id,
    SPELLS.BLOOD_MIRROR_TALENT.id,
    SPELLS.MARK_OF_BLOOD_TALENT.id,
    SPELLS.BLOOD_TAP_TALENT.id,
    SPELLS.ANTIMAGIC_BARRIER_TALENT.id,
    SPELLS.TOMBSTONE_TALENT.id,
    SPELLS.RUNE_TAP_TALENT.id,
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
