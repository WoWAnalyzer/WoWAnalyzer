import React from 'react';

import SPELLS from 'common/SPELLS';

import Tab from 'Main/Tab';
import Analyzer from 'Parser/Core/Analyzer';
import HealingValue from 'Parser/Core/Modules/HealingValue';

import isAtonement from '../Core/isAtonement';
import AtonementSource from './AtonementSource';
import AtonementHealingBreakdown from './AtonementHealingBreakdown';
import Penance from '../Spells/Penance';

class AtonementHealingDone extends Analyzer {
  static dependencies = {
    atonementSource: AtonementSource,
    penance: Penance,
  };

  _totalAtonement = new HealingValue();
  _total = 0;

  _lastPenanceBoltNumber = 0;

  get totalAtonement() {
    return this._totalAtonement;
  }
  bySource = {};

  on_byPlayer_absorbed(event){
    this._total += event.amount || 0;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid === SPELLS.PENANCE.id) {
      this._lastPenanceBoltNumber = event.penanceBoltNumber;
    }
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

    if(spellId === SPELLS.PENANCE.id) {
      if(!this.bySource[SPELLS.PENANCE.id].bolts) {
        this.bySource[SPELLS.PENANCE.id].bolts = [0,0,0,0];
      }

      this.bySource[SPELLS.PENANCE.id].bolts[this._lastPenanceBoltNumber] += (amount + absorbed) || 0;

    }
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
