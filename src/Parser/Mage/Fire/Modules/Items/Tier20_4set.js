import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

import Combatants from 'Parser/Core/Modules/Combatants';
import Module from 'Parser/Core/Module';
import getDamageBonus from 'Parser/Mage/Shared/Modules/GetDamageBonus';

const CRITICAL_MASSIVE_DAMAGE_BONUS = 0.1;

class Tier20_4set extends Module {
  static dependencies = {
    combatants: Combatants,
  }

  damage = 0;

  on_initialized() {
	  this.active = this.combatants.selected.hasBuff(SPELLS.FIRE_MAGE_T20_4SET_BONUS_BUFF.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid === SPELLS.PYROBLAST.id || event.ability.guid === SPELLS.FLAMESTRIKE.id) {
      if (this.combatants.selected.hasBuff(SPELLS.CRITICAL_MASSIVE.id, event.timestamp)) {
        this.damage += getDamageBonus(event, CRITICAL_MASSIVE_DAMAGE_BONUS);
      }
    }
  }

  item() {
    return {
      id: `${SPELLS.FIRE_MAGE_T20_4SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.FIRE_MAGE_T20_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.FIRE_MAGE_T20_4SET_BONUS_BUFF.id} />,
      result: `${formatNumber(this.damage)} damage - ${this.owner.formatItemDamageDone(this.damage)}`,
    };
  }
}

export default Tier20_4set;
