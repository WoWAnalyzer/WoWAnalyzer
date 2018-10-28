import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class LightOfDawn extends Analyzer {
  _casts = this.counter();
  _heals = this.counter();

  constructor(props) {
    super(props);
    this.addEventListener('cast', {
      by: SELECTED_PLAYER,
      spell: SPELLS.LIGHT_OF_DAWN_CAST,
    }, this._casts);
    this.addEventListener('heal', {
      by: SELECTED_PLAYER,
      spell: SPELLS.LIGHT_OF_DAWN_HEAL,
    }, this._heals);
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(60)}
        icon={<SpellIcon id={SPELLS.LIGHT_OF_DAWN_CAST.id} />}
        value={`${((this._heals.value / this._casts.value) || 0).toFixed(2)} players`}
        label="Average hits per cast"
      />
    );
  }
}

export default LightOfDawn;
