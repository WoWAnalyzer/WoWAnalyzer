import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

const RuinicDiscound=5;

class T20_2pc extends Module {
  static dependencies = {
    combatants: Combatants,
  }

  DeathAndDecayCounter = 0;
  RunicPowerSaved=0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.BLOOD_T20_4PC_GRAVEWARDEN.id);
    console.log('You have the 4pc');
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DEATH_AND_DECAY.id) {
      this.DeathAndDecayCounter++;
    }
  }


  item() {
    this.RunicPowerSaved=this.DeathAndDecayCounter*RuinicDiscound;
    return {
      id: `spell-${SPELLS.BLOOD_T20_4PC_GRAVEWARDEN.id}`,
      icon: <SpellIcon id={SPELLS.BLOOD_T20_4PC_GRAVEWARDEN.id} />,
      title: <SpellLink id={SPELLS.BLOOD_T20_4PC_GRAVEWARDEN.id}/>,
      result: <span>Saved Runic Power - <strong>{this.RunicPowerSaved}</strong></span>,
    };
  }
}

export default T20_2pc;
