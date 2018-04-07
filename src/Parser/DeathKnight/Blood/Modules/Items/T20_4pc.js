import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const GRAVEWARDEN_RUNIC_DISCOUNT = 5;

class T20_4pc extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };


  deathStrikeBuffless=0;
  deathStrikeTotal=0;


  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.BLOOD_DEATH_KNIGHT_T20_4SET_BONUS_BUFF.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DEATH_STRIKE.id) {
      return;
    }
    if (!this.combatants.selected.hasBuff(SPELLS.GRAVEWARDEN.id, event.timestamp)) {
      this.deathStrikeBuffless += 1;
    }
    this.deathStrikeTotal += 1;

  }

  item() {
    const runicPowerLost = this.deathStrikeBuffless * GRAVEWARDEN_RUNIC_DISCOUNT;
    return {
      id: `spell-${SPELLS.BLOOD_DEATH_KNIGHT_T20_4SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.BLOOD_DEATH_KNIGHT_T20_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.BLOOD_DEATH_KNIGHT_T20_4SET_BONUS_BUFF.id} icon={false} />,
      result: <span><strong>{this.deathStrikeBuffless}/{this.deathStrikeTotal} </strong> <SpellLink id={SPELLS.DEATH_STRIKE.id} /> casted without the <SpellLink id={SPELLS.GRAVEWARDEN.id} /> buff. <strong>{runicPowerLost}</strong> Runic Power Lost </span>,
    };
  }
}

export default T20_4pc;
