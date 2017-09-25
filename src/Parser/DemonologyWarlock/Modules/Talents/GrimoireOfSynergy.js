import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import CorePets from 'Parser/Core/Modules/Pets';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import PETS from 'common/PETS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import getDamageBonus from '../WarlockCore/getDamageBonus';

const GRIMOIRE_OF_SYNERGY_DAMAGE_BONUS = 0.25;

class SoulHarvestTalent extends Module {
  static dependencies = {
    combatants: Combatants,
    pets: CorePets,
  };

  _bonusPlayerDamage = 0;
  _bonusPetDamage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.GRIMOIRE_OF_SYNERGY_TALENT.id) || this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_NETHERLORD.id);
  }

  on_byPlayer_damage(event) {
    if (this.combatants.selected.hasBuff(SPELLS.GRIMOIRE_OF_SYNERGY_BUFF.id, event.timestamp)) {
      this._bonusPlayerDamage += getDamageBonus(event, GRIMOIRE_OF_SYNERGY_DAMAGE_BONUS);
    }
  }

  _isPermanentPet(guid) {
    return Object.keys(PETS).map(key => PETS[key]).every(pet => pet.id !== guid);
  }

  on_byPlayerPet_damage(event) {
    const pet = this.pets.getSourceEntity(event);
    if (!this._isPermanentPet(pet.guid)) {
      return;
    }
    if (pet.hasBuff(SPELLS.GRIMOIRE_OF_SYNERGY_BUFF.id, event.timestamp)) {
      this._bonusPetDamage += getDamageBonus(event, GRIMOIRE_OF_SYNERGY_DAMAGE_BONUS);
    }
  }

  statistic() {
    // TODO: Works correctly, but perhaps showing the DPS as a statistic might be better? Seeing 45% uptime sounds like it's bad, but 160k DPS increase at the same time sounds better
    // plus GoSyn is random proc, so we can't affect the uptime by any means anyway
    const uptime = this.combatants.selected.getBuffUptime(SPELLS.GRIMOIRE_OF_SYNERGY_BUFF.id) / this.owner.fightDuration;
    const totalBonusDamage = this._bonusPetDamage + this._bonusPlayerDamage;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GRIMOIRE_OF_SYNERGY_TALENT.id} />}
        value={`${formatPercentage(uptime)} %`}
        label="GoSyn uptime"
        tooltip={`Your Grimoire of Synergy contributed ${formatNumber(totalBonusDamage)} total damage (${this.owner.formatItemDamageDone(totalBonusDamage)}) - ${formatNumber(this._bonusPlayerDamage)} damage for you, ${formatNumber(this._bonusPetDamage)} damage for your pet.`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(4);
}

export default SoulHarvestTalent;
