import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import getDamageBonus from 'Parser/Core/calculateEffectiveDamage';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';

/**
 * Magnetized Blasting Cap Launcher
 * Equip: Increases Bursting Shot's damage by 800% and range by 30 yards.
 */
const DAMAGE_INCREASE_MODIFIER = 8;

class MagnetizedBlastingCapLauncher extends Analyzer {
  bonusDmg = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasWrists(ITEMS.MAGNETIZED_BLASTING_CAP_LAUNCHER.id);
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
