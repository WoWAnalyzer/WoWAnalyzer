import React from 'react';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';
import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    // Guardian:
    SPELLS.MANGLE_BEAR.id,
    SPELLS.THRASH_BEAR.id,
    SPELLS.BEAR_SWIPE.id,
    SPELLS.MOONFIRE.id,
    SPELLS.MAUL.id,
    SPELLS.BEAR_FORM.id,
    SPELLS.CAT_FORM.id,
    SPELLS.MOONKIN_FORM.id,
    SPELLS.INCAPACITATING_ROAR.id,
    SPELLS.STAMPEDING_ROAR_BEAR.id,
    SPELLS.STAMPEDING_ROAR_CAT.id,

    // Talents
    SPELLS.INTIMIDATING_ROAR_TALENT.id,
    SPELLS.TYPHOON_TALENT.id,
    SPELLS.PULVERIZE_TALENT.id,
    SPELLS.MIGHTY_BASH_TALENT.id,
    SPELLS.MASS_ENTANGLEMENT_TALENT.id,
    SPELLS.WILD_CHARGE_TALENT.id,
  ];

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> Your downtime can be improved. Try to Always Be Casting (ABC).</span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.15);
      });
  }

  statistic() {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<Icon icon="spell_mage_altertime" alt="Downtime" />}
        value={`${formatPercentage(deadTimePercentage)} %`}
        label="Downtime"
        tooltip="Downtime is available casting time not used. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), etc."
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default AlwaysBeCasting;
