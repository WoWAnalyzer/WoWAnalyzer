import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';


const T19_2SET_HEALING_INCREASE = 0.15;
const TIDAL_WAVES_BUFF_EXPIRATION_BUFFER = 50; // the buff expiration can occur several MS before the heal event is logged, this is the buffer time that an IoL charge may have dropped during which it will still be considered active.

class Restoration_Shaman_T19_2Set extends Analyzer {
  healing = 0;

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasBuff(SPELLS.RESTORATION_SHAMAN_T19_2SET_BONUS_BUFF.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (!(spellId === SPELLS.HEALING_WAVE.id) && !(spellId === SPELLS.HEALING_SURGE_RESTORATION.id)) {
      return;
    }


    if (!this.owner.modules.combatants.selected.hasBuff(SPELLS.TIDAL_WAVES_BUFF.id, event.timestamp, TIDAL_WAVES_BUFF_EXPIRATION_BUFFER)) {
      return;
    }

    this.healing += calculateEffectiveHealing(event, T19_2SET_HEALING_INCREASE);
  }

  item() {
    return {
      id: `spell-${SPELLS.RESTORATION_SHAMAN_T19_2SET_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.RESTORATION_SHAMAN_T19_2SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.RESTORATION_SHAMAN_T19_2SET_BONUS_BUFF.id} />,
      result: this.owner.formatItemHealingDone(this.healing),
    };
  }

}

export default Restoration_Shaman_T19_2Set;
