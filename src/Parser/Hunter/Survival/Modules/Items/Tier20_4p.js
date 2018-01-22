import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';
import Enemies from 'Parser/Core/Modules/Enemies';

const T20_4P_DMG_BONUS = 0.1;

/**
 * Mongoose Bite deals 10% increased damage to targets bleeding from your Lacerate.
 */
class Tier20_4p extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };
  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HUNTER_SV_T20_4P_BONUS.id);
  }
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MONGOOSE_BITE.id) {
      return;
    }
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    if (enemy.hasBuff(SPELLS.LACERATE.id, event.timestamp)) {
      this.bonusDmg += getDamageBonus(event, T20_4P_DMG_BONUS);

    }
  }

  item() {
    return {
      id: `spell-${SPELLS.HUNTER_SV_T20_4P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.HUNTER_SV_T20_4P_BONUS.id} />,
      title: <SpellLink id={SPELLS.HUNTER_SV_T20_4P_BONUS.id} />,
      result: <ItemDamageDone amount={this.bonusDmg} />,
    };
  }
}

export default Tier20_4p;
