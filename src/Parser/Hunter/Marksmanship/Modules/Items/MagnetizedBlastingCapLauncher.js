import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * Magnetized Blasting Cap Launcher
 * Equip: Increases Bursting Shot's damage by 800% and range by 30 yards.
 */
const DAMAGE_INCREASE_MODIFIER = 8;

class MagnetizedBlastingCapLauncher extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.MAGNETIZED_BLASTING_CAP_LAUNCHER.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BURSTING_SHOT.id) {
      return;
    }
    this.bonusDmg += getDamageBonus(event, DAMAGE_INCREASE_MODIFIER);
  }

  item() {
    return {
      item: ITEMS.MAGNETIZED_BLASTING_CAP_LAUNCHER,
      result: <ItemDamageDone amount={this.bonusDmg} />,
    };
  }
}

export default MagnetizedBlastingCapLauncher;
