import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

const GRAVEWARDEN_RUNIC_DISCOUNT=5;

class T20_2pc extends Module {
  static dependencies = {
    combatants: Combatants,
  }

  deathAndDecayCounter = 0;


  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.BLOOD_DEATH_KNIGHT_T20_4SET_BONUS_BUFF.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.DEATH_AND_DECAY.id) {
      this.deathAndDecayCounter++;
    }
  }


  item() {
    const runicPowerSaved = this.deathAndDecayCounter * GRAVEWARDEN_RUNIC_DISCOUNT;
    return {
      id: `spell-${SPELLS.BLOOD_DEATH_KNIGHT_T20_4SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.BLOOD_DEATH_KNIGHT_T20_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.BLOOD_DEATH_KNIGHT_T20_4SET_BONUS_BUFF.id}/>,
      result: <span><strong>{runicPowerSaved}</strong> Runic Power Saved</span>,
    };
  }
}

export default T20_2pc;
