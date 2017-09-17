import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import getDamageBonus from '../../WarlockCore/getDamageBonus';

const LESSONS_OF_SPACETIME_DAMAGE_BONUS = 0.1;

class LessonsOfSpaceTime extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  _petIds = new Set();

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasShoulder(ITEMS.LESSONS_OF_SPACETIME.id);
    this.owner.playerPets.forEach(pet => {
      this._petIds.add(pet.id);
    });
  }

  on_damage(event) {
    if (!this._petIds.has(event.sourceID)) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.LESSONS_OF_SPACETIME_BUFF.id, event.timestamp)) {
      this.bonusDmg += getDamageBonus(event, LESSONS_OF_SPACETIME_DAMAGE_BONUS);
    }
  }

  on_byPlayer_damage(event) {
    if (this.combatants.selected.hasBuff(SPELLS.LESSONS_OF_SPACETIME_BUFF.id, event.timestamp)) {
      this.bonusDmg += getDamageBonus(event, LESSONS_OF_SPACETIME_DAMAGE_BONUS);
    }
  }

  item() {
    return {
      item: ITEMS.LESSONS_OF_SPACETIME,
      result: `${formatNumber(this.bonusDmg)} damage contributed - ${this.owner.formatItemDamageDone(this.bonusDmg)}`,
    };
  }
}

export default LessonsOfSpaceTime;
