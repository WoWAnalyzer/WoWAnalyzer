import React from 'react';
import Icon from 'common/Icon';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class GCD extends Module {
  suggestions(when) {
    const deadTimePercentage = this.owner.modules.alwaysBeCasting.totalTimeWasted / this.owner.fightDuration;
    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(`Your dead GCD time can be improved. Try to Always Be Casting (ABC); cast instant spells during movement phases and focus on having no delays between spell casts`)
          .icon("spell_mage_altertime")
          .actual(`${Math.round(deadTimePercentage * 100)}% dead GCD time`)
          .recommended(`<${(formatPercentage(recommended))}% is recommended`)
          .regular(recommended).major(recommended + 0.35);
      });
  }

  statistic() {
    const deadTimePercentage = this.owner.modules.alwaysBeCasting.totalTimeWasted / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<Icon icon="spell_mage_altertime" alt="Dead GCD time" />}
        value={`${formatPercentage(deadTimePercentage)} %`}
        label="Dead GCD time"
        tooltip={`Dead GCD time is available casting time not used. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), etc.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default GCD;
