import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatNumber } from 'common/format';
import Module from 'Parser/Core/Module';
import getDamageBonus from '../MageCore/GetDamageBonus';


class Tier20_2set extends Module {
  static dependencies = {
    combatants: Combatants,
  }

  damage = 0;

  on_initialized() {
	this.active = this.combatants.selected.hasBuff(SPELLS.FROST_MAGE_T20_2SET_BONUS_BUFF.id);
  }

  on_byPlayer_damage(event) {
    if (this.combatants.selected.hasBuff(SPELLS.FROZEN_MASS.id)) {
      this.damage += getDamageBonus(event, 0.2);
    }
  }

  item() {
    return {
      id: `spell-${SPELLS.FROZEN_MASS.id}`,
      icon: <SpellIcon id={SPELLS.FROZEN_MASS.id} />,
      title: <SpellLink id={SPELLS.FROZEN_MASS.id} />,
      result: `${formatNumber(this.damage)} damage - ${this.owner.formatItemDamageDone(this.damage)}`,
    };
  }
}

export default Tier20_2set;
