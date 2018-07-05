import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import ItemDamageDone from 'Main/ItemDamageDone';

const ASHES_TO_DUST_MODIFIER = 0.15;

class AshesToDust extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  damageDone = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasShoulder(ITEMS.ASHES_TO_DUST.id) && this.selectedCombatant.hasTalent(SPELLS.WAKE_OF_ASHES_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if(event.targetIsFriendly) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (enemy && enemy.hasBuff(SPELLS.WAKE_OF_ASHES_TALENT.id)) {
      this.damageDone += calculateEffectiveDamage(event, ASHES_TO_DUST_MODIFIER);
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
