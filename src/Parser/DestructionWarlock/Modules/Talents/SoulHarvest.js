import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import getDamageBonus from '../WarlockCore/getDamageBonus';

const SOUL_HARVEST_DAMAGE_BONUS = .2;

class SoulHarvest extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  talentBonusDmg = 0;
  chestBonusDmg = 0;

  _petIds = new Set();
  _isFromTalent = false;

  addToCorrectSource(bonusDmg) {
    if (this._isFromTalent) {
      this.talentBonusDmg += bonusDmg;
    }    else {
      this.chestBonusDmg += bonusDmg;
    }
  }

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SOUL_HARVEST_TALENT.id) || this.combatants.selected.hasChest(ITEMS.THE_MASTER_HARVESTER.id);
    this.owner.report.friendlyPets.filter(pet => pet.petOwner === this.owner.playerId).forEach(pet => {
      this._petIds.has(pet.id);
    });
  }

  on_damage(event) {
    if (!this._petIds.has(event.sourceID)) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.SOUL_HARVEST.id, event.timestamp)) {
      this.addToCorrectSource(getDamageBonus(event, SOUL_HARVEST_DAMAGE_BONUS));
    }
  }

  on_byPlayer_damage(event) {
    if (this.combatants.selected.hasBuff(SPELLS.SOUL_HARVEST.id, event.timestamp)) {
      this.addToCorrectSource(getDamageBonus(event, SOUL_HARVEST_DAMAGE_BONUS));
    }
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.SOUL_HARVEST.id) {
      this._isFromTalent = true;
    }
  }

  on_byPlayer_removebuff(event) {
    // Soul Harvest from the talent dropped off, so if any SH is present while this is false, it means it's a legendary proc
    if (event.ability.guid === SPELLS.SOUL_HARVEST.id && this._isFromTalent) {
      this._isFromTalent = false;
    }
  }

  on_byPlayer_refreshbuff(event) {
    // if the buff gets refreshed, it can't happen from the talent itself (it has 2 minute cooldown)
    // therefore the buff is now from the chest (if it prolonged the duration or overwritten it doesn't matter, all I care about is the source)
    if (event.ability.guid === SPELLS.SOUL_HARVEST.id && this._isFromTalent) {
      this._isFromTalent = false;
    }
  }
}

export default SoulHarvest;
