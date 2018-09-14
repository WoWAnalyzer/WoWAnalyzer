import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'Parser/Core/Analyzer';

class TrailOfLight extends Analyzer {

  totalHealing = 0;
  overhealing = 0;
  absorbed = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.TRAIL_OF_LIGHT_TALENT.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.TRAIL_OF_LIGHT_HEAL.id) {
      return;
    }
    this.overhealing += event.overheal || 0;
    this.totalHealing+= (event.amount || 0) + (event.absorbed || 0);
  }
}

export default TrailOfLight;
