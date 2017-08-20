import Module from 'Parser/Core/Module';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import getDamageBonus from '../../WarlockCore/getDamageBonus';

const SOUL_HARVEST_DAMAGE_BONUS = .2;

class TheMasterHarvester extends Module {
  playerBonusDmg = 0;
  petBonusDmg = 0;

  petIds = [];
  on_initialized() {
    this.active = this.owner.selectedCombatant.hasChest(ITEMS.THE_MASTER_HARVESTER.id);
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

  item() {
    const totalDmg = this.playerBonusDmg + this.petBonusDmg;
    return {
      item: ITEMS.THE_MASTER_HARVESTER,
      result: `${formatNumber(totalDmg)} damage contributed - ${this.owner.formatItemDamageDone(totalDmg)}`,
    };
  }
}

export default TheMasterHarvester;
