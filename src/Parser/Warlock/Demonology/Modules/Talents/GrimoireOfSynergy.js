import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import CorePets from 'Parser/Core/Modules/Pets';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import PETS from 'common/PETS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const GRIMOIRE_OF_SYNERGY_DAMAGE_BONUS = 0.25;

class GrimoireOfSynergy extends Analyzer {
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
      this._bonusPlayerDamage += calculateEffectiveDamage(event, GRIMOIRE_OF_SYNERGY_DAMAGE_BONUS);
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
      this._bonusPetDamage += calculateEffectiveDamage(event, GRIMOIRE_OF_SYNERGY_DAMAGE_BONUS);
    }
  }

  statistic() {
    // could show uptime as well but it's out of our control so I thought showing the damage instead would be more beneficial.
    const totalBonusDamage = this._bonusPetDamage + this._bonusPlayerDamage;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GRIMOIRE_OF_SYNERGY_TALENT.id} />}
        value={`${formatNumber(totalBonusDamage / this.owner.fightDuration * 1000)} DPS`}
        label="Grimoire of Synergy damage"
        tooltip={`Your Grimoire of Synergy contributed ${formatNumber(totalBonusDamage)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(totalBonusDamage))} %) - ${formatNumber(this._bonusPlayerDamage)} damage for you, ${formatNumber(this._bonusPetDamage)} damage for your pet.`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(4);
}

export default GrimoireOfSynergy;
