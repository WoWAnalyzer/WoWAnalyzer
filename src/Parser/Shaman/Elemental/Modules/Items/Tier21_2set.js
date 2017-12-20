import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';


class Tier21_2set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  extraDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.ELEMENTAL_SHAMAN_T21_2SET_BUFF.id);
  }

  on_byPlayer_damage(event) {
    if (this.combatants.selected.hasBuff(SPELLS.EARTHEN_STRENGTH.id)) {
      if (event.ability.guid === SPELLS.EARTH_SHOCK.id || event.ability.guid === SPELLS.EARTHQUAKE.id) {
        this.extraDmg += (event.amount + event.absorbed || 0) * 20 / 120;
      }
    }
  }

  item() {
    return {
      id: `spell-${SPELLS.ELEMENTAL_SHAMAN_T21_2SET_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.ELEMENTAL_SHAMAN_T21_2SET_BUFF.id} />,
      title: <SpellLink id={SPELLS.ELEMENTAL_SHAMAN_T21_2SET_BUFF.id} />,
      result: formatNumber(this.extraDmg),
    };
  }
}
export default Tier21_2set;
