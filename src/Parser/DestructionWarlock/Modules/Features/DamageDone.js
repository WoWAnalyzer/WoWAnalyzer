import React from 'react';

import { formatThousands, formatNumber } from 'common/format';

import CoreDamageDone from 'Parser/Core/Modules/DamageDone';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class DamageDone extends CoreDamageDone {
  petDmg = 0;

  _petIds = [];

  on_initialized() {
    this.owner.report.friendlyPets.filter(pet => pet.petOwner === this.owner.playerId).forEach((pet) => {
      if (this._petIds.indexOf(pet.id) === -1) {
        this._petIds.push(pet.id);
      }
    });
  }

  on_damage(event) {
    if (this._petIds.indexOf(event.sourceID) === -1) {
      return;
    }
    this.petDmg += event.amount + (event.absorbed || 0);
  }

  statistic() {
    const totalDmg = this.total.effective + this.petDmg;
    return (
      <StatisticBox
        icon={(
          <img
            src="/specs/Warlock-Destruction.jpg"
            style={{ border: 0 }}
            alt="Destruction Warlock"
          />)}
        value={`${formatNumber((totalDmg / this.owner.fightDuration) * 1000)} DPS`}
        label='Damage done'
        tooltip={`The total damage (including pets) recorded was ${formatThousands(totalDmg)}`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(0);
}

export default DamageDone;
