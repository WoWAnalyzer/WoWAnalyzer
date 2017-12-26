import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    // Note: I need to add a few more instant cast procs with different ids
    // Enhancement:
    SPELLS.ROCKBITER.id,
    SPELLS.FROSTBRAND.id,
    SPELLS.FLAMETONGUE.id,
    SPELLS.CRASH_LIGHTNING.id,
    SPELLS.FERAL_SPIRIT.id,

    SPELLS.LIGHTNING_BOLT.id,
    SPELLS.STORMSTRIKE.id,
    SPELLS.LAVA_LASH.id,
    SPELLS.FURY_OF_AIR_TALENT.id,

    SPELLS.EARTHEN_SPIKE_TALENT.id,
    SPELLS.DOOM_WINDS.id,
    SPELLS.SUNDERING_TALENT.id,
  ];

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Even if you have to move, try casting something instant with range like <SpellLink id={SPELLS.FLAMETONGUE.id} /> or <SpellLink id={SPELLS.ROCKBITER.id} /></span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.2);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
