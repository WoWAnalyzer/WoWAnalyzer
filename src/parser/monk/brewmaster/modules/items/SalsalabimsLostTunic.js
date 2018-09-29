import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';

import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/core/modules/SpellUsable';

/**
 * The Brewmaster legendary Sal'salabim's Lost Tunic, aka 'saladbums'.
 *
 * Resets the cooldown on Breath of Fire when you cast Keg Smash.
 */
class SalsalabimsLostTunic extends Analyzer {
  static dependencies = {
    spells: SpellUsable,
  };

  cooldownResets = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasChest(ITEMS.SALSALABIMS_LOST_TUNIC.id);
  }

  on_byPlayer_cast(event) {
    if(event.ability.guid !== SPELLS.KEG_SMASH.id) {
      return;
    }
    if(this.spells.isOnCooldown(SPELLS.BREATH_OF_FIRE.id)) {
      this.cooldownResets += 1;
      this.spells.endCooldown(SPELLS.BREATH_OF_FIRE.id);
    }
  }

  item() {
    return {
      item: ITEMS.SALSALABIMS_LOST_TUNIC,
      result: (
          <React.Fragment>{this.cooldownResets} <SpellLink id={SPELLS.BREATH_OF_FIRE.id} /> resets</React.Fragment>
      ),
    };
  }
}

export default SalsalabimsLostTunic;
