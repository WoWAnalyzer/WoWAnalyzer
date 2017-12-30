import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import { formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import Combatants from 'Parser/Core/Modules/Combatants';

class SalsalabimsLostTunic extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spells: SpellUsable,
  };

  cooldownResets = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasChest(ITEMS.SALSALABIMS_LOST_TUNIC.id);
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
        <dfn>
          <SpellLink id={SPELLS.BREATH_OF_FIRE.id} /> cooldown reset {this.cooldownResets} times.
        </dfn>
      ),
    };
  }
}

export default SalsalabimsLostTunic;
