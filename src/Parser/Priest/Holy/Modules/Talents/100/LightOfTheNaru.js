import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
import React from 'react';

class LightOfTheNaru extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.LIGHT_OF_THE_NAARU_TALENT.id);
  }

  statistic() {
    return (

      <StatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.LIGHT_OF_THE_NAARU_TALENT.id} />}
        value={"Value"}
        label="Light of the Naaru"
        tooltip={``}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default LightOfTheNaru;
