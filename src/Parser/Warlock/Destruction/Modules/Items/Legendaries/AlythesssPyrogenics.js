import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';
import ItemDamageDone from 'Main/ItemDamageDone';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

const ALYTHESSS_PYROGENICS_DAMAGE_BONUS = 0.1;

const AFFECTED_SPELLS = new Set([
  SPELLS.INCINERATE.id,
  SPELLS.CONFLAGRATE.id,
  SPELLS.IMMOLATE_DEBUFF.id,
  SPELLS.IMMOLATE_CAST.id,
  SPELLS.CHANNEL_DEMONFIRE_DAMAGE.id,
  SPELLS.RAIN_OF_FIRE_DAMAGE.id,
]);

class AlythesssPyrogenics extends Analyzer {
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
    this.bonusDmg += calculateEffectiveDamage(event, ALYTHESSS_PYROGENICS_DAMAGE_BONUS);
  }

  item() {
    return {
      item: ITEMS.ALYTHESSS_PYROGENICS,
      result: <ItemDamageDone amount={this.bonusDmg} />,
    };
  }
}

export default AlythesssPyrogenics;
