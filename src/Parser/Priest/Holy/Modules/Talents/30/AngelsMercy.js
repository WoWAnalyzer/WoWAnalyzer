import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
import React from 'react';

class AngelsMercy extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ANGELS_MERCY_TALENT.id);
  }

  statistic() {
    return (

      <StatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.ANGELS_MERCY_TALENT.id} />}
        value={"Value"}
        label="Angels Mercy"
        tooltip={``}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default AngelsMercy;
