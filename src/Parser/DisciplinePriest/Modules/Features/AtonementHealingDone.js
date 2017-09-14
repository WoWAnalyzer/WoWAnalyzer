import React from 'react';

import Tab from 'Main/Tab';
import Module from 'Parser/Core/Module';
import HealingValue from 'Parser/Core/Modules/HealingValue';

import isAtonement from '../Core/isAtonement';
import AtonementSource from './AtonementSource';
import AtonementHealingBreakdown from './AtonementHealingBreakdown';

class AtonementHealingDone extends Module {
  static dependencies = {
    atonementSource: AtonementSource,
  };

  _total = new HealingValue();
  get total() {
    return this._total;
  }
  bySource = {};

  on_byPlayer_heal(event) {
    if (!isAtonement(event)) {
      return;
    }
    const source = this.atonementSource.atonementDamageSource;
    this._addHealing(source, event.amount, event.absorbed, event.overheal);
  }
  _addHealing(source, amount = 0, absorbed = 0, overheal = 0) {
    const ability = source.ability;
    const spellId = ability.guid;
    this._total = this._total.add(amount, absorbed, overheal);
    this.bySource[spellId] = this.bySource[spellId] || {};
    this.bySource[spellId].ability = ability;
    this.bySource[spellId].healing = (this.bySource[spellId].healing || new HealingValue()).add(amount, absorbed, overheal);
  }

  tab() {
    return {
      title: 'Atonement sources',
      url: 'atonement-sources',
      render: () => (
        <Tab title="Atonement sources">
          <AtonementHealingBreakdown
            total={this.total}
            bySource={this.bySource}
          />
        </Tab>
      ),
    };
  }
}

export default AtonementHealingDone;
