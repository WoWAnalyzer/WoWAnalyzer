import React from 'react';

import Tab from 'Main/Tab';
import Analyzer from 'Parser/Core/Analyzer';
import HealingValue from 'Parser/Core/Modules/HealingValue';

import isAtonement from '../Core/isAtonement';
import AtonementSource from './AtonementSource';
import AtonementHealingBreakdown from './AtonementHealingBreakdown';

class AtonementHealingDone extends Analyzer {
  static dependencies = {
    atonementSource: AtonementSource,
  };

  _totalAtonement = new HealingValue();
  _total = 0;

  get totalAtonement() {
    return this._totalAtonement;
  }
  bySource = {};

  on_byPlayer_absorbed(event){
    this._total += event.amount || 0;
  }

  on_byPlayer_heal(event) {

    this._total += event.amount || 0;
    this._total += event.absorbed || 0;

    if (!isAtonement(event)) {
      return;
    }

    const source = this.atonementSource.atonementDamageSource;
    if (source) {
      this._addHealing(source, event.amount, event.absorbed, event.overheal);
    }
  }
  // FIXME: 'byAbility()' added to HealingDone, this should no longer require custom code
  _addHealing(source, amount = 0, absorbed = 0, overheal = 0) {
    const ability = source.ability;
    const spellId = ability.guid;
    this._totalAtonement = this._totalAtonement.add(amount, absorbed, overheal);
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
            totalAtonement={this.totalAtonement}
            bySource={this.bySource}
            total={this._total}
          />
        </Tab>
      ),
    };
  }
}

export default AtonementHealingDone;
