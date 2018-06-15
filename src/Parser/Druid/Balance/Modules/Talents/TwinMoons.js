import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class TwinMoons extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  moonfireCasts = 0;
  moonfireHits = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.TWIN_MOONS_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.MOONFIRE_BEAR.id || event.tick === true) {
      return;
    }
      this.moonfireHits++;
  }
  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.MOONFIRE.id) {
      return;
    }
      this.moonfireCasts++;
  }

  get percentTwoHits() {
    return (this.moonfireHits - this.moonfireCasts) / this.moonfireCasts;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.TWIN_MOONS_TALENT.id} />}
        value={`${formatPercentage(this.percentTwoHits)} %`}
        label="Double hits"
        tooltip={`You hit ${this.moonfireHits} times with ${this.moonfireCasts} casts.`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default TwinMoons;
