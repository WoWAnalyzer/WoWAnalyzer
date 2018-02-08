import React from 'react';

import SPELLS from 'common/SPELLS';
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
  mehFrostShockCount = 0;

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.FROST_SHOCK.id) {
      this.active = true;
      if (!this.combatants.selected.hasBuff(210714, event.timestamp))
        this.badFrostShockCount++;

      const resource = event.classResources[0];
      if (resource.type === RESOURCE_TYPES.MAELSTROM.id)
        if (resource.amount < 20)
          this.badFrostShockCount++;
      
      if (!this.combatants.selected.hasBuff(SPELLS.ELEMENTAL_FOCUS.id, event.timestamp))
        this.mehFrostShockCount++;
    }
  }
  suggestions(when) {
    when(this.badFrostShockCount).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.FROST_SHOCK.id} /> can be improved.</span>)
          .icon(SPELLS.FROST_SHOCK.icon)
          .actual(`${this.badFrostShockCount} bad Casts`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(1).major(3);
      });
  }
}

export default FrostShock;
