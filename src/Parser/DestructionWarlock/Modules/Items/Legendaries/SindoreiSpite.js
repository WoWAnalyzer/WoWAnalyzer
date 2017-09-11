import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import getDamageBonus from '../../WarlockCore/getDamageBonus';

const SINDOREI_SPITE_DAMAGE_BONUS = .15;

class SoulHarvest extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;

  _petIds = [];

  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.SINDOREI_SPITE.id);
    this.owner.report.friendlyPets.filter(pet => pet.petOwner === this.owner.playerId).forEach(pet => {
      if (this._petIds.indexOf(pet.id) === -1) {
        this._petIds.push(pet.id);
      }
    });
  }

  on_damage(event) {
    if (this._petIds.indexOf(event.sourceID) === -1) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.SINDOREI_SPITE_BUFF.id, event.timestamp)) {
      this.bonusDmg += getDamageBonus(event, SINDOREI_SPITE_DAMAGE_BONUS);
    }
  }

  on_byPlayer_damage(event) {
    if (this.combatants.selected.hasBuff(SPELLS.SINDOREI_SPITE_BUFF.id, event.timestamp)) {
      this.bonusDmg += getDamageBonus(event, SINDOREI_SPITE_DAMAGE_BONUS);
    }
  }

  item() {
    return {
      item: ITEMS.SINDOREI_SPITE,
      result: `${formatNumber(this.bonusDmg)} damage contributed - ${this.owner.formatItemDamageDone(this.bonusDmg)}`,
    };
  }
}

export default SoulHarvest;
