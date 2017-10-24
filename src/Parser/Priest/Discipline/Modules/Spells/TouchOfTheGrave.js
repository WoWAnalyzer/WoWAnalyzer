import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import isAtonement from '../Core/isAtonement';
import AtonementSource from '../Features/AtonementSource';

class TouchOfTheGrave extends Analyzer {
  static dependencies = {
    atonementSource: AtonementSource,
  };

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
    if (this.atonementSource.atonementDamageSource.ability.guid !== SPELLS.TOUCH_OF_THE_GRAVE.id) {
      return;
    }
    this.healing += event.amount + (event.absorbed || 0);
  }
}

export default TouchOfTheGrave;
