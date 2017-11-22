import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';

const HIT_BUFFER_MS = 500;

class KiljaedensBurningWish extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  hitTimestamp;
  casts = 0;
  hits = 0;
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.KILJAEDENS_BURNING_WISH.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.KILJAEDENS_BURNING_WISH_DAMAGE.id) {
      return;
    }

    this.hits += 1;
    // KJBW doesn't produce cast events when used, for whatever reason, so we guess them from damage events
    // Multiple damage events together is obviously the result of one cast, not several.
    if (!this.hitTimestamp || this.hitTimestamp + HIT_BUFFER_MS < event.timestamp) {
      this.hitTimestamp = event.timestamp;
      // TODO instead fabricate cast event?
      this.casts += 1;
      // obviously this is maybe a second after the cooldown actually began, but it's close enough
      this.spellUsable.beginCooldown(SPELLS.KILJAEDENS_BURNING_WISH_CAST.id);
    }

    this.damage += event.amount + (event.absorbed || 0);
  }

  item() {
    return {
      item: ITEMS.KILJAEDENS_BURNING_WISH,
      result: (
        <dfn data-tip={`You got ${this.hits} hits over ${this.casts} casts, for an average of <b>${((this.hits / this.casts) || 0).toFixed(2)} hits per cast</b>`}>
        {this.owner.formatItemDamageDone(this.damage)}
        </dfn>
      ),
    };
  }
}

export default KiljaedensBurningWish;
