import React from 'react';

import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemDamageDone from 'Main/ItemDamageDone';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import { UNSTABLE_AFFLICTION_DEBUFF_IDS } from '../../../Constants';

const DAMAGE_BONUS_PER_TARGET = 0.04;

class StretensSleeplessShackles extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.STRETENS_SLEEPLESS_SHACKLES.id);
  }

  on_byPlayer_damage(event) {
    const enemies = this.enemies.getEntities();
    const numberOfEnemiesWithUA = Object.keys(enemies)
      .map(x => enemies[x])
      .filter(enemy => UNSTABLE_AFFLICTION_DEBUFF_IDS.some(uaId => enemy.hasBuff(uaId, event.timestamp))).length;
    this.bonusDmg += calculateEffectiveDamage(event, numberOfEnemiesWithUA * DAMAGE_BONUS_PER_TARGET);
  }

  item() {
    return {
      item: ITEMS.STRETENS_SLEEPLESS_SHACKLES,
      result: <ItemDamageDone amount={this.bonusDmg} />,
    };
  }
}

export default StretensSleeplessShackles;
