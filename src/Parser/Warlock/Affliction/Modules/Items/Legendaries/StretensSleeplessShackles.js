import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import ITEMS from 'common/ITEMS';

import ItemDamageDone from 'Interface/Others/ItemDamageDone';

import { UNSTABLE_AFFLICTION_DEBUFF_IDS } from '../../../Constants';

const DAMAGE_BONUS_PER_TARGET = 0.04;

class StretensSleeplessShackles extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  bonusDmg = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasWrists(ITEMS.STRETENS_SLEEPLESS_SHACKLES.id);
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
