import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
// import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    SPELLS.RAKE.id,
    SPELLS.RIP.id,
    SPELLS.SHRED.id,
    SPELLS.CAT_SWIPE.id,
    SPELLS.FEROCIOUS_BITE.id,
    SPELLS.SAVAGE_ROAR.id,
    SPELLS.ASHAMANES_FRENZY.id,
    SPELLS.REGROWTH.id,
    SPELLS.MAIM.id,
    SPELLS.THRASH_BEAR.id,

    SPELLS.MIGHTY_BASH_TALENT.id,
    SPELLS.DISPLACER_BEAST_TALENT.id,
    SPELLS.TYPHOON_TALENT.id,
    SPELLS.MASS_ENTANGLEMENT_TALENT.id,

    SPELLS.BEAR_FORM.id,
    SPELLS.CAT_FORM.id,
    SPELLS.MOONKIN_FORM.id,
    SPELLS.TRAVEL_FORM.id,
    SPELLS.STAG_FORM.id,
  ];

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your dead GCD time can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells.</span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% dead GCD time`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.2);
      });
  }

  statistic() {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<Icon icon="spell_mage_altertime" alt="Dead time" />}
        value={`${formatPercentage(deadTimePercentage)} %`}
        label="Dead time"
        tooltip="Dead time is available casting time not used for casting any spell. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/being stunned), etc."
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
