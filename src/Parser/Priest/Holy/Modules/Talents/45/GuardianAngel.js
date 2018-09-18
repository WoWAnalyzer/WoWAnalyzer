import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';
import React from 'react';

// Example Log: /report/hRd3mpK1yTQ2tDJM/1-Mythic+MOTHER+-+Kill+(2:24)/14-丶寶寶小喵
class GuardianAngel extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GUARDIAN_ANGEL_TALENT.id);
  }

  statistic() {
    return (

      <StatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.GUARDIAN_ANGEL_TALENT.id} />}
        value={"Value"}
        label="Guardian Angel"
        tooltip={``}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default GuardianAngel;
