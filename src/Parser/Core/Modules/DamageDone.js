import React from 'react';

import { formatThousands, formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import DamageValue from './DamageValue';

class DamageDone extends Module {
  _total = new DamageValue();
  get total() {
    return this._total;
  }
  _byPet = {};
  byPet(petId) {
    if (!this._byPet[petId]) {
      return new DamageValue();
    }
    return this._byPet[petId];
  }
  get totalByPets() {
    return Object.keys(this._byPet)
      .map(petId => this._byPet[petId])
      .reduce((total, damageValue) => total.add(damageValue.regular, damageValue.absorbed, damageValue.overkill), new DamageValue());
  }

  on_byPlayer_damage(event) {
    if (!event.targetIsFriendly) {
      this._total = this._total.add(event.amount || 0, event.absorbed || 0, event.overheal || 0);
    }
  }
  on_byPlayerPet_damage(event) {
    if (!event.targetIsFriendly) {
      this._total = this._total.add(event.amount || 0, event.absorbed || 0, event.overheal || 0);
      const petId = event.sourceID;
      this._byPet[petId] = this.byPet(petId).add(event.amount || 0, event.absorbed || 0, event.overheal || 0);
    }
  }

  showStatistic = false;
  statistic() {
    return this.showStatistic && (
      <StatisticBox
        icon={(
          <img
            src="/img/sword.png"
            style={{ border: 0 }}
            alt="Sword"
          />
        )}
        value={`${formatNumber(this.total.effective / (this.owner.fightDuration / 1000))} DPS`}
        label="Damage done"
        tooltip={`The total damage done was ${formatThousands(this.total.effective)}. Pets contributed ${formatNumber(this.totalByPets.effective / (this.owner.fightDuration / 1000))} DPS.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(0);
}

export default DamageDone;
