import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';
import GetDamageBonus from 'Parser/Paladin/Shared/Modules/GetDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

const ASHES_TO_DUST_MODIFIER = 0.15;

class AshesToDust extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  damageDone = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasShoulder(ITEMS.ASHES_TO_DUST.id) && this.combatants.selected.hasTalent(SPELLS.WAKE_OF_ASHES_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if(event.targetIsFriendly) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (enemy && enemy.hasBuff(SPELLS.WAKE_OF_ASHES_TALENT.id)) {
      this.damageDone += GetDamageBonus(event, ASHES_TO_DUST_MODIFIER);
    }
  }

  item() {
    return {
      item: ITEMS.ASHES_TO_DUST,
      result: <ItemDamageDone amount={this.damageDone} />,
    };
  }
}

export default AshesToDust;
