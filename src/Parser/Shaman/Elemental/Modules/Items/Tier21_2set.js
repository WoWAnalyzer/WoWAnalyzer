import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'Interface/Others/ItemDamageDone';


class Tier21_2set extends Analyzer {
  extraDmg = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBuff(SPELLS.ELEMENTAL_SHAMAN_T21_2SET_BUFF.id);
  }

  on_byPlayer_cast(event) {
    if (this.selectedCombatant.hasBuff(SPELLS.EARTHEN_STRENGTH.id)) {
      if (event.ability.guid === SPELLS.EARTHQUAKE.id) {
        this.active = false;
      }
    }
  }

  on_byPlayer_damage(event) {
    if (this.selectedCombatant.hasBuff(SPELLS.EARTHEN_STRENGTH.id)) {
      if (event.ability.guid === SPELLS.EARTH_SHOCK.id) {
        this.extraDmg += (event.amount + event.absorbed || 0) * 20 / 120;
      }
    }
  }

  item() {
    return {
      id: `spell-${SPELLS.ELEMENTAL_SHAMAN_T21_2SET_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.ELEMENTAL_SHAMAN_T21_2SET_BUFF.id} />,
      title: <SpellLink id={SPELLS.ELEMENTAL_SHAMAN_T21_2SET_BUFF.id} icon={false} />,
      result: <ItemDamageDone amount={this.extraDmg} />,
    };
  }
}
export default Tier21_2set;
