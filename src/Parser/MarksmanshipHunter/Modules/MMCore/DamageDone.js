import React from 'react';
import Icon from 'common/Icon';
import { formatNumber } from 'common/format';

import CoreDamageDone from 'Parser/Core/Modules/DamageDone';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class DamageDone extends CoreDamageDone {
  petDmg = 0;
  petIds = [];
  totalDmg = 0;

  on_initialized() {
    this.owner.report.friendlyPets.filter(pet => pet.petOwner === this.owner.playerId).forEach((pet) => {
      if (this.petIds.indexOf(pet.id) === -1) {
        this.petIds.push(pet.id);
      }
    });
  }

  on_damage(event) {
    if (this.petIds.indexOf(event.sourceID) === -1) {
      return;
    }
    this.petDmg += event.amount;
  }

  on_finished() {
    this.totalDmg = this.petDmg + this.total.effective;
    this.dmgTooltip = (this.set_tooltip());
  }
  set_tooltip() {
    if (this.petDmg > 0) {
      return `The total damage done recorded was ${formatNumber(this.totalDmg)}. Pets contributed ${formatNumber(this.petDmg)}`;
    } else
      return `The total damage done recorded was ${formatNumber(this.totalDmg)}.`;
  }

  statistic() {
    const mmDmgTooltip = this.dmgTooltip;
    return (
      <StatisticBox
        icon={<Icon icon="class_hunter" alt="DPS stats" />}
        value={`${formatNumber(this.totalDmg / this.owner.fightDuration * 1000)} DPS`}
        label="Damage Done"
        tooltip={mmDmgTooltip}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(0);
}

export default DamageDone;
