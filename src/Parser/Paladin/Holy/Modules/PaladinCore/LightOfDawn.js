import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class LightOfDawn extends Analyzer {
  casts = 0;
  heals = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_DAWN_CAST.id) {
      return;
    }

    this.casts += 1;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_DAWN_HEAL.id) {
      return;
    }

    this.heals += 1;
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.LIGHT_OF_DAWN_CAST.id} />}
        value={`${((this.heals / this.casts) || 0).toFixed(2)} players`}
        label="Average hits per cast"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(60);
}

export default LightOfDawn;
