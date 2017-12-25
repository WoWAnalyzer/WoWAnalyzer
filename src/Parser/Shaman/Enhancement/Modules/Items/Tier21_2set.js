import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';


class Tier21_2set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  extraDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.ENHANCE_SHAMAN_T21_2SET_EQUIP.id);
  }

  on_byPlayer_damage(event) {
    if (this.combatants.selected.hasBuff(254308)) {  //ForceOfTheMountain.id
      if (event.ability.guid === SPELLS.ROCKBITER.id) {
        this.extraDmg += (event.amount + event.absorbed || 0)/2;
      }
    }
  }

  item() {
    return {
      id: `spell-${SPELLS.FORCE_OF_THE_MOUNTAIN.id}`,
      icon: <SpellIcon id={SPELLS.FORCE_OF_THE_MOUNTAIN.id} />,
      title: <SpellLink id={SPELLS.FORCE_OF_THE_MOUNTAIN.id} />,
      result: this.owner.formatItemDamageDone(this.extraDmg),
    };
  }
}
export default Tier21_2set;
