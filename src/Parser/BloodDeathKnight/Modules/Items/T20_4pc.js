import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

const GRAVEWARDEN_RUNIC_DISCOUNT = 5;

class T20_4pc extends Module {
  static dependencies = {
    combatants: Combatants,
  }


  deathStrinkeBuffless=0;
  deathStrikeTotal=0;


  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.BLOOD_DEATH_KNIGHT_T20_4SET_BONUS_BUFF.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DEATH_STRIKE.id && !this.combatants.selected.hasBuff(SPELLS.GRAVEWARDEN.id, event.timestamp)) {
      this.deathStrinkeBuffless += 1;
    }else{
      if (spellId === SPELLS.DEATH_STRIKE.id) {
        this.deathStrikeTotal += 1;
      }
    }

  }

  item() {
    const runicPowerLost = this.deathStrinkeBuffless * GRAVEWARDEN_RUNIC_DISCOUNT;
    return {
      id: `spell-${SPELLS.BLOOD_DEATH_KNIGHT_T20_4SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.BLOOD_DEATH_KNIGHT_T20_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.BLOOD_DEATH_KNIGHT_T20_4SET_BONUS_BUFF.id} />,
      result: <span><strong>{this.deathStrinkeBuffless}/{this.deathStrikeTotal} </strong> <SpellLink id={SPELLS.DEATH_STRIKE.id} /> casted without the <SpellLink id={SPELLS.GRAVEWARDEN.id} /> buff. <strong>{runicPowerLost}</strong> Runic Power Lost </span>,
    };
  }
}

export default T20_4pc;
