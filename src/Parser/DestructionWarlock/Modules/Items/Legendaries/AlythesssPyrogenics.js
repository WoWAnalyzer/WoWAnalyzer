import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import getDamageBonus from '../../WarlockCore/getDamageBonus';

const ALYTHESSS_PYROGENICS_DAMAGE_BONUS = 0.1;

const AFFECTED_SPELLS = new Set([
  SPELLS.INCINERATE.id,
  SPELLS.CONFLAGRATE.id,
  SPELLS.IMMOLATE_DEBUFF.id,
  SPELLS.IMMOLATE_CAST.id,
  SPELLS.CHANNEL_DEMONFIRE_DAMAGE.id,
  SPELLS.RAIN_OF_FIRE_DAMAGE.id,
]);

class AlythesssPyrogenics extends Module {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.ALYTHESSS_PYROGENICS.id);
  }

  on_byPlayer_damage(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.ALYTHESSS_PYROGENICS_DEBUFF.id, event.timestamp) || !AFFECTED_SPELLS.has(event.ability.guid)) {
      return;
    }
    this.bonusDmg += getDamageBonus(event, ALYTHESSS_PYROGENICS_DAMAGE_BONUS);
  }

  item() {
    return {
      item: ITEMS.ALYTHESSS_PYROGENICS,
      result: (
        <dfn data-tip={`Total bonus damage contributed: ${formatNumber(this.bonusDmg)}`}>
          {this.owner.formatItemDamageDone(this.bonusDmg)}
        </dfn>
      ),
    };
  }
}

export default AlythesssPyrogenics;
