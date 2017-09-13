import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import isAtonement from '../Core/isAtonement';

class TouchOfTheGrave extends Module {
  healing = 0;
  damage = 0;

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.TOUCH_OF_THE_GRAVE.id) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }
  on_byPlayer_heal(event) {
    if (!isAtonement(event)) {
      return;
    }
    if (this.owner.modules.atonementSource.atonementDamageSource.ability.guid !== SPELLS.TOUCH_OF_THE_GRAVE.id) {
      return;
    }
    this.healing += event.amount + (event.absorbed || 0);
  }
}

export default TouchOfTheGrave;
