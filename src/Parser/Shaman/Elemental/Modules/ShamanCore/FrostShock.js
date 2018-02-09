import React from 'react';

import SPELLS from 'common/SPELLS';
import TALENTS from 'common/SPELLS/TALENTS/SHAMAN';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';

class FrostShock extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  badFrostShockCount = 0;
  suboptimalFrostShockCount = 0;  //not used yet, wanna talk to tc-people for thresholds

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.FROST_SHOCK.id) {
      this.active = true;
      if (!this.combatants.selected.hasBuff(TALENTS.ICEFURY_TALENT.id, event.timestamp))
        this.badFrostShockCount++;

      const resource = event.classResources[0];
      if (resource.type === RESOURCE_TYPES.MAELSTROM.id)
        if (resource.amount < 20)
          this.badFrostShockCount++;

      if (!this.combatants.selected.hasBuff(SPELLS.ELEMENTAL_FOCUS.id, event.timestamp))
        this.suboptimalFrostShockCount++;
    }
  }
  suggestions(when) {
    when(this.badFrostShockCount).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.FROST_SHOCK.id} /> can be improved.</span>)
          .icon(SPELLS.FROST_SHOCK.icon)
          .actual(`${this.badFrostShockCount} bad Casts. Only cast Frost Shock when you have Ice Fury-Stacks left and at least 20 Maelstrom`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(1).major(3);
      });
  }
}

export default FrostShock;
