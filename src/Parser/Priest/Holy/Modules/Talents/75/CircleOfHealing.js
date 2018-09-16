import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
import React from 'react';

class CircleOfHealing extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CIRCLE_OF_HEALING_TALENT.id);
  }

  statistic() {
    return (

      <StatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.CIRCLE_OF_HEALING_TALENT.id} />}
        value={"Value"}
        label="Circle of Healing"
        tooltip={``}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default CircleOfHealing;
