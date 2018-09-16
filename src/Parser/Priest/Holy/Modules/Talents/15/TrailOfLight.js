import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import STATISTIC_CATEGORY from 'Interface/Others/STATISTIC_CATEGORY';
import SpellIcon from 'common/SpellIcon';

class TrailOfLight extends Analyzer {

  totalHealing = 0;
  overhealing = 0;
  absorbed = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TRAIL_OF_LIGHT_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.TRAIL_OF_LIGHT_HEAL.id) {
      return;
    }
    this.overhealing += event.overheal || 0;
    this.totalHealing+= (event.amount || 0) + (event.absorbed || 0);
  }

  statistic() {
    return (

      <StatisticBox
        category={STATISTIC_CATEGORY.TALENTS}
        icon={<SpellIcon id={SPELLS.TRAIL_OF_LIGHT_TALENT.id} />}
        value={"Value"}
        label="Trail of Light"
        tooltip={``}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default TrailOfLight;
