import React from 'react';

import CoreCancelledCasts from 'Parser/Core/Modules/CancelledCasts';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';

class CancelledCasts extends CoreCancelledCasts {
  static CANCELABLE_ABILITIES = [
    //Castable/Non Instant Spells that you want to track to see if they were cancelled.
    //Spells that have a cast time which is sometimes instant can also be included.
    SPELLS.FROSTBOLT.id,
    SPELLS.EBONBOLT.id,
    SPELLS.BLIZZARD.id,
    //Talents
    SPELLS.GLACIAL_SPIKE_TALENT.id,
    SPELLS.RUNE_OF_POWER_TALENT.id,
    SPELLS.RAY_OF_FROST_TALENT.id,
    SPELLS.RING_OF_FROST_TALENT.id,
    SPELLS.FROST_BOMB_TALENT.id,
  ];

  suggestions(when) {
    const cancelledPercentage = this.cancelledCasts / this.castsStarted;

    when(cancelledPercentage).isGreaterThan(0.05)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You cancelled {formatPercentage(cancelledPercentage)}% of your spells. While it is expected that you will have to cancel a few casts to react to a boss mechanic or to move, you should try to ensure that you are cancelling as few casts as possible.</span>)
          .icon('inv_misc_map_01')
          .actual(`${formatPercentage(actual)}% casts cancelled`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(.1).major(recommended + 0.2);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default CancelledCasts;
