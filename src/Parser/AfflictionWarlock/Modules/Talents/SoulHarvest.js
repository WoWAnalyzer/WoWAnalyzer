import React from 'react';

import Module from 'Parser/Core/Module';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import getDamageBonus from '../WarlockCore/getDamageBonus';

const SOUL_HARVEST_DAMAGE_BONUS = .2;

class SoulHarvest extends Module {
  playerBonusDmg = 0;
  petBonusDmg = 0;

  petIds = [];

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTalent(SPELLS.SOUL_HARVEST_TALENT.id) || this.owner.selectedCombatant.hasChest(ITEMS.THE_MASTER_HARVESTER.id);
    }
    this.owner.report.friendlyPets.filter(pet => pet.petOwner === this.owner.playerId).forEach(pet => {
      if (this.petIds.indexOf(pet.id) === -1) {
        this.petIds.push(pet.id);
      }
    });
  }

  on_damage(event) {
    if (this.petIds.indexOf(event.sourceID) === -1) {
      return;
    }
    if (this.owner.selectedCombatant.hasBuff(SPELLS.SOUL_HARVEST.id, event.timestamp)) {
      this.petBonusDmg += getDamageBonus(event, SOUL_HARVEST_DAMAGE_BONUS);
    }
  }

  on_byPlayer_damage(event) {
    if (this.owner.selectedCombatant.hasBuff(SPELLS.SOUL_HARVEST.id, event.timestamp)) {
      this.playerBonusDmg += getDamageBonus(event, SOUL_HARVEST_DAMAGE_BONUS);
    }
  }

  statistic() {
    const totalDmg = this.playerBonusDmg + this.petBonusDmg;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SOUL_HARVEST.id} />}
        value={`${formatNumber(totalDmg / this.owner.fightDuration * 1000)} DPS`}
        label='Damage contributed'
        tooltip={`Your Soul Harvest buff (from talent or The Master Harvester) contributed ${formatNumber(totalDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(totalDmg))} %).`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(2);
}

export default SoulHarvest;
