import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events from 'parser/core/Events';

class TwinMoons extends Analyzer {
  moonfireCasts = 0;
  moonfireHits = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TWIN_MOONS_TALENT.id);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MOONFIRE_BEAR), this.onDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MOONFIRE), this.onCast);
  }

  onDamage(event) {
    if (event.tick === true) {
      return;
    }
    this.moonfireHits += 1;
  }
  onCast(event) {
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
