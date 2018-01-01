import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

class DenialOfHalfGiants extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  durationPerCp = 0.2;
  totalValue = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.DENIAL_OF_THE_HALF_GIANTS.id);
  }

  on_byPlayer_spendresource(event) {
    if (event.resourceChangeType !== RESOURCE_TYPES.COMBO_POINTS.id) return;
    if (!this.combatants.selected.hasBuff(SPELLS.SHADOW_BLADES.id)) return;

    const spent = event.resourceChange;

    this.totalValue += spent * this.durationPerCp;
  }

  item() {
    return {
      item: ITEMS.DENIAL_OF_THE_HALF_GIANTS,
      result: <Wrapper>{this.totalValue.toFixed(1)} seconds added to <SpellLink id={SPELLS.SHADOW_BLADES.id} />.</Wrapper>,
    };
  }
}

export default DenialOfHalfGiants;
