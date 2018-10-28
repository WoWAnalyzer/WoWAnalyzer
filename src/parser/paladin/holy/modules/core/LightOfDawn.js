import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class EventFilter {
  event;
  constructor(event) {
    this.event = event;
  }
  by;
  by(by) {
    this.by = by;
    return this;
  }
  spell;
  spell(spell) {
    this.spell = spell;
    return this;
  }
}

const Events = {
  get cast() {
    return new EventFilter('cast');
  },
  get heal() {
    return new EventFilter('heal');
  },
};

class LightOfDawn extends Analyzer {
  _casts = 0;
  _heals = 0;
  constructor(props) {
    super(props);
    // addEventListener(string|EventFilter eventFilter, func handler): void
    // we probably should autobind handler for comfort
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_DAWN_CAST), this._onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.LIGHT_OF_DAWN_HEAL), this._onHeal);
  }

  _onCast(event) {
    this._casts += 1;
  }
  _onHeal(event) {
    this._heals += 1;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(60)}
        icon={<SpellIcon id={SPELLS.LIGHT_OF_DAWN_CAST.id} />}
        value={`${((this._heals / this._casts) || 0).toFixed(2)} players`}
        label="Average hits per cast"
      />
    );
  }
}

export default LightOfDawn;
