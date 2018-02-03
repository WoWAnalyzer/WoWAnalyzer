import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

const SOUL_HARVEST_DAMAGE_BONUS = 0.2;

class SoulHarvest extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  talentBonusDmg = 0;
  chestBonusDmg = 0;

  _isFromTalent = false;

  _addToCorrectSource(bonusDmg) {
    if (this._isFromTalent) {
      this.talentBonusDmg += bonusDmg;
    } else {
      this.chestBonusDmg += bonusDmg;
    }
  }

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SOUL_HARVEST_TALENT.id) || this.combatants.selected.hasChest(ITEMS.THE_MASTER_HARVESTER.id);
  }

  on_byPlayer_damage(event) {
    if (this.combatants.selected.hasBuff(SPELLS.SOUL_HARVEST_TALENT.id, event.timestamp)) {
      this._addToCorrectSource(calculateEffectiveDamage(event, SOUL_HARVEST_DAMAGE_BONUS));
    }
  }

  on_byPlayerPet_damage(event) {
    if (this.combatants.selected.hasBuff(SPELLS.SOUL_HARVEST_TALENT.id, event.timestamp)) {
      this._addToCorrectSource(calculateEffectiveDamage(event, SOUL_HARVEST_DAMAGE_BONUS));
    }
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.SOUL_HARVEST_TALENT.id) {
      this._isFromTalent = true;
    }
  }

  on_byPlayer_removebuff(event) {
    // Soul Harvest from the talent dropped off, so if any SH is present while this is false, it means it's a legendary proc
    if (event.ability.guid === SPELLS.SOUL_HARVEST_TALENT.id && this._isFromTalent) {
      this._isFromTalent = false;
    }
  }

  on_byPlayer_refreshbuff(event) {
    // if the buff gets refreshed, it can't happen from the talent itself (it has 2 minute cooldown)
    // therefore the buff is now from the chest (if it prolonged the duration or overwritten it doesn't matter, all I care about is the source)
    if (event.ability.guid === SPELLS.SOUL_HARVEST_TALENT.id && this._isFromTalent) {
      this._isFromTalent = false;
    }
  }
}

export default SoulHarvest;
