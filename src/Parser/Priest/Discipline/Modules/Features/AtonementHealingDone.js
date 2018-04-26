import React from 'react';

import SPELLS from 'common/SPELLS';

import Tab from 'Main/Tab';
import Analyzer from 'Parser/Core/Analyzer';
import HealingValue from 'Parser/Core/Modules/HealingValue';

import isAtonement from '../Core/isAtonement';
import AtonementDamageSource from './AtonementDamageSource';
import AtonementHealingBreakdown from './AtonementHealingBreakdown';
import Penance from '../Spells/Penance';

class AtonementHealingDone extends Analyzer {
  static dependencies = {
    atonementDamageSource: AtonementDamageSource,
    penance: Penance,
  };

  _totalAtonement = new HealingValue();
  total = 0;

  _lastPenanceBoltNumber = 0;

  get totalAtonement() {
    return this._totalAtonement;
  }
  bySource = {};

  on_byPlayer_absorbed(event) {
    this.total += event.amount || 0;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid === SPELLS.PENANCE.id) {
      this._lastPenanceBoltNumber = event.penanceBoltNumber;
    }
  }

  on_byPlayer_heal(event) {
    this.total += event.amount || 0;
    this.total += event.absorbed || 0;

    if (!isAtonement(event)) {
      return;
    }

    const sourceEvent = this.atonementDamageSource.event;
    if (sourceEvent) {
      this._addHealing(sourceEvent, event.amount, event.absorbed, event.overheal);
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

    if (spellId === SPELLS.PENANCE.id) {
      const source = this.bySource[SPELLS.PENANCE.id];
      if (!source.bolts) {
        source.bolts = [];
      }

      if (!source.bolts[this._lastPenanceBoltNumber]) {
        source.bolts[this._lastPenanceBoltNumber] = new HealingValue();
      }
      source.bolts[this._lastPenanceBoltNumber] = source.bolts[this._lastPenanceBoltNumber].add(amount, absorbed, overheal);
    }
  }

  tab() {
    return {
      title: 'Atonement sources',
      url: 'atonement-sources',
      render: () => (
        <Tab>
          <AtonementHealingBreakdown analyzer={this} />
        </Tab>
      ),
    };
  }
}

export default AtonementHealingDone;
