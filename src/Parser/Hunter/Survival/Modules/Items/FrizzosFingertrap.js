import React from 'react';

import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

/**
 * Frizzo's Fingertrap
 * Equip: Increases damage done by Butchery and Carve by 10%.
 */

const DAMAGE_MODIFIER = 0.1;

class FrizzosFingertrap extends Analyzer {

  bonusDmg = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasFinger(ITEMS.FRIZZOS_FINGERTRAP.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BUTCHERY_TALENT.id && spellId !== SPELLS.CARVE.id) {
      return;
    }
    this.bonusDmg += calculateEffectiveDamage(event, DAMAGE_MODIFIER);
  }

  item() {
    return {
      item: ITEMS.FRIZZOS_FINGERTRAP,
      result: <ItemDamageDone amount={this.bonusDmg} />,

    };
  }
}

export default FrizzosFingertrap;
