import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SCHOOLS from 'common/MAGIC_SCHOOLS';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import ItemDamageDone from 'Interface/Others/ItemDamageDone';

/**
 * While Pillar of Frost is active, you deal 15% increased Frost damage.
 */

const DAMAGE_MODIFIER = .15;

class ToravonsWhiteoutBindings extends Analyzer {
  bonusDamage = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasWrists(ITEMS.TORAVONS_WHITEOUT_BINDINGS.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.type !== SCHOOLS.ids.FROST || event.targetIsFriendly) {
      return;
    }
    if (this.selectedCombatant.hasBuff(SPELLS.TORAVONS_WHITEOUT_BINDINGS.id)) {
      this.bonusDamage += calculateEffectiveDamage(event, DAMAGE_MODIFIER);
    }
  }

  item() {
    return {
      item: ITEMS.TORAVONS_WHITEOUT_BINDINGS,
      result: <ItemDamageDone amount={this.bonusDamage} />,
    };
  }
}

export default ToravonsWhiteoutBindings;
