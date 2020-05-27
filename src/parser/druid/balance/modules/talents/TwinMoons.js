import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class TwinMoons extends Analyzer {
  moonfireCasts = 0;
  moonfireHits = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TWIN_MOONS_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.MOONFIRE_BEAR.id || event.tick === true) {
      return;
    }
      this.moonfireHits += 1;
  }
  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.MOONFIRE.id) {
      return;
    }
      this.moonfireCasts += 1;
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
