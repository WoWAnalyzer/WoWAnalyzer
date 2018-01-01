import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ItemDamageDone from 'Main/ItemDamageDone';

import getDamageBonus from '../../WarlockCore/getDamageBonus';

const LESSONS_OF_SPACETIME_DAMAGE_BONUS = 0.1;

class LessonsOfSpaceTime extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasShoulder(ITEMS.LESSONS_OF_SPACETIME.id);
  }

  on_byPlayer_damage(event) {
    if (this.combatants.selected.hasBuff(SPELLS.LESSONS_OF_SPACETIME_BUFF.id, event.timestamp)) {
      this.bonusDmg += getDamageBonus(event, LESSONS_OF_SPACETIME_DAMAGE_BONUS);
    }
  }

  on_byPlayerPet_damage(event) {
    if (this.combatants.selected.hasBuff(SPELLS.LESSONS_OF_SPACETIME_BUFF.id, event.timestamp)) {
      this.bonusDmg += getDamageBonus(event, LESSONS_OF_SPACETIME_DAMAGE_BONUS);
    }
  }

  item() {
    return {
      item: ITEMS.LESSONS_OF_SPACETIME,
      result: <ItemDamageDone amount={this.bonusDmg} />,
    };
  }
}

export default LessonsOfSpaceTime;
