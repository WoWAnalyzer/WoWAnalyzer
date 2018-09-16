import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'Parser/Core/Analyzer';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';

class Afterlife extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.AFTERLIFE_TALENT.id);
  }

  statistic() {
    return (

      <StatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.AFTERLIFE_TALENT.id} />}
        value={"Value"}
        label="Afterlife"
        tooltip={``}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default Afterlife;
