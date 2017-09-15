import React from 'react';

import { formatThousands, formatNumber } from 'common/format';

import CoreDamageDone from 'Parser/Core/Modules/DamageDone';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class DamageDone extends CoreDamageDone {
  petDmg = 0;

  _petIds = new Set();

  on_initialized() {
    this.owner.playerPets.forEach(pet => {
      this._petIds.add(pet.id);
    });
  }

  on_damage(event) {
    if (!this._petIds.has(event.sourceID)) {
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
            src="/specs/Warlock-Demonology.jpg"
            style={{ border: 0 }}
            alt="Demonology Warlock"
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
