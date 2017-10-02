import React from 'react';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import getDamageBonus from '../../WarlockCore/getDamageBonus';
import { UNSTABLE_AFFLICTION_DEBUFF_IDS } from '../../../Constants';

const DAMAGE_BONUS_PER_TARGET = 0.04;

class StretensSleeplessShackles extends Module {
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
    this.bonusDmg += getDamageBonus(event, numberOfEnemiesWithUA * DAMAGE_BONUS_PER_TARGET);
  }

  item() {
    return {
      item: ITEMS.STRETENS_SLEEPLESS_SHACKLES,
      result: (
        <dfn data-tip={`Total bonus damage contributed: ${formatNumber(this.bonusDmg)}`}>
          {this.owner.formatItemDamageDone(this.bonusDmg)}
        </dfn>
      ),
    };
  }
}

export default StretensSleeplessShackles;
