import React from 'react';

import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';

import { formatPercentage } from 'common/format';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [

    // Abilities
    SPELLS.DEMONS_BITE.id,
    SPELLS.ANNIHILATION.id,
    SPELLS.BLADE_DANCE.id,
    SPELLS.CHAOS_STRIKE.id,
    SPELLS.DEATH_SWEEP.id,
    SPELLS.EYE_BEAM.id,
    SPELLS.FURY_OF_THE_ILLIDARI.id,
    SPELLS.METAMORPHOSIS_HAVOC.id,
    SPELLS.THROW_GLAIVE.id,
    SPELLS.CHAOS_NOVA.id,
    SPELLS.BLUR.id,

    // Talents
    SPELLS.FELBLADE_TALENT.id,
    SPELLS.FEL_BARRAGE_TALENT.id,
    SPELLS.FEL_ERUPTION_TALENT.id,
  ];

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.15)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your dead GCD time can be improved. Try to Always Be Casting (ABC); try to reduce the delay between casting spells and when you\'re not healing try to contribute some damage.')
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% dead GCD time`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.15);
      });
  }
  statistic() {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<Icon icon="spell_mage_altertime" alt="Dead GDC time" />}
        value={`${formatPercentage(deadTimePercentage)} %`}
        label="Dead GCD time"
        tooltip={'Dead GCD time is available casting time not used. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), etc.'}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default AlwaysBeCasting;
