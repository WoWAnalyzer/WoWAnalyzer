import React from 'react';

import Module from 'Parser/Core/Module';

import {formatThousands, formatNumber } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class DamageDone extends Module {
  totalPetDmgDone = 0;

  petIds = [];

  on_initialized() {
    this.owner.report.friendlyPets.filter(pet => pet.petOwner === this.owner.playerId).forEach(pet => {
      if(this.petIds.indexOf(pet.id) === -1)
        this.petIds.push(pet.id);
    });
  }

  on_damage(event) {
    if(this.petIds.indexOf(event.sourceID) === -1)
      return;
    this.totalPetDmgDone += event.amount;
  }

  statistic() {
    const totalDmg = this.owner.totalDamageDone + this.totalPetDmgDone;
    return (
      <StatisticBox
        icon={(
          <img
            src="/specs/Warlock-Affliction.jpg"
            style={{ border: 0 }}
            alt="Affliction Warlock"
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
