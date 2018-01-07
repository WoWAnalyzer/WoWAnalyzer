import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import getDamageBonus from 'Parser/Mage/Shared/Modules/GetDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

const INFERNO_DAMAGE_BONUS = 0.1;

/**
 * Fire Mage Tier21 4set
 * Combustion also increases your critical strike damage by 10% for 14 sec.
 */
class Tier21_4set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
	this.active = this.combatants.selected.hasBuff(SPELLS.FIRE_MAGE_T21_4SET_BONUS_BUFF.id);
  }

  on_byPlayer_damage(event) {
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.INFERNO.id)) {
      this.damage += getDamageBonus(event, INFERNO_DAMAGE_BONUS);
    }
  }

  item() {
    return {
      id: SPELLS.FIRE_MAGE_T21_4SET_BONUS_BUFF.id,
      icon: <SpellIcon id={SPELLS.FIRE_MAGE_T21_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.FIRE_MAGE_T21_4SET_BONUS_BUFF.id} />,
      result: <ItemDamageDone amount={this.damage} />,
    };
  }
}

export default Tier21_4set;
