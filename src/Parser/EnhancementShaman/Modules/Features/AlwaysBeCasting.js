import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
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
    SPELLS.SUNDERING.id,
  ];

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your dead GCD time can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Even if you have to move, try casting something instant - maybe refresh your dots or replenish your mana with <SpellLink id={SPELLS.LIFE_TAP.id}/></span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(deadTimePercentage)}% dead GCD time`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.2);
      });
  }

  statistic() {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<Icon icon='spell_mage_altertime' alt='Dead time' />}
        value={`${formatPercentage(deadTimePercentage)} %`}
        label='Dead time'
        tooltip='Dead time is available casting time not used for casting any spell. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/being stunned), etc.'
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
