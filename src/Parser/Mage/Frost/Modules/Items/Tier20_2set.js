import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Combatants from 'Parser/Core/Modules/Combatants';
import Module from 'Parser/Core/Module';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import getDamageBonus from 'Parser/Mage/Shared/Modules/GetDamageBonus';

const FROZEN_MASS_DAMAGE_BONUS = 0.2;

class Tier20_2set extends Module {
  static dependencies = {
    combatants: Combatants,
  }

  damage = 0;

  on_initialized() {
	this.active = this.combatants.selected.hasBuff(SPELLS.FROST_MAGE_T20_2SET_BONUS_BUFF.id);
  }

  on_byPlayer_damage(event) {
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.FROZEN_MASS.id)) {
      this.damage += getDamageBonus(event, FROZEN_MASS_DAMAGE_BONUS);
    }
  }

  item() {
    return {
      id: SPELLS.FROZEN_MASS.id,
      icon: <SpellIcon id={SPELLS.FROZEN_MASS.id} />,
      title: <SpellLink id={SPELLS.FROZEN_MASS.id} />,
      result: this.owner.formatItemDamageDone(this.damage),
    };
  }
}

export default Tier20_2set;
