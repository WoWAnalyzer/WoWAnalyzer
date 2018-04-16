import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import ItemDamageDone from 'Main/ItemDamageDone';

const FROZEN_MASS_DAMAGE_BONUS = 0.2;

/**
 * Frost Mage Tier20 2set
 * Frozen Orb increases your critical strike damage by 20% for 10 sec.
 */
class Tier20_2set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;

  on_initialized() {
	this.active = this.combatants.selected.hasBuff(SPELLS.FROST_MAGE_T20_2SET_BONUS_BUFF.id);
  }

  on_byPlayer_damage(event) {
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.FROZEN_MASS.id)) {
      this.damage += calculateEffectiveDamage(event, FROZEN_MASS_DAMAGE_BONUS);
    }
  }

  item() {
    return {
      id: SPELLS.FROST_MAGE_T20_2SET_BONUS_BUFF.id,
      icon: <SpellIcon id={SPELLS.FROST_MAGE_T20_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.FROST_MAGE_T20_2SET_BONUS_BUFF.id} icon={false} />,
      result: <ItemDamageDone amount={this.damage} />,
    };
  }
}

export default Tier20_2set;
