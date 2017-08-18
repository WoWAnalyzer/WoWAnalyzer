import React from 'react';

import {formatThousands, formatNumber } from 'common/format';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = true;

class DamageDone extends Module {
  totalPetDmgDone = 0;
  damageBySource = {};
  on_damage(event) {
    if(!event.targetIsFriendly) {
      if(!this.damageBySource[event.sourceID])
        this.damageBySource[event.sourceID] = 0;
      this.damageBySource[event.sourceID] += event.amount;
    }
  }

  on_finished() {
    this.owner.report.friendlyPets.filter(pet => pet.petOwner === this.owner.playerId).forEach(pet => {
      if (this.damageBySource[pet.id]) {
        this.totalPetDmgDone += this.damageBySource[pet.id];
      }
    });
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
}

export default DamageDone;
