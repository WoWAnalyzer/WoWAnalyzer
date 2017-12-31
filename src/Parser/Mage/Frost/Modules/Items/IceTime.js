import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemDamageDone from 'Main/ItemDamageDone';

/**
 * Ice Time:
 * Your Frozen Orb explodes into a Frost Nova that deals (600% of Spell power) damage.
 */
class IceTime extends Analyzer {

  static dependencies = {
		combatants: Combatants,
	};

  casts = 0;
  hits = 0;
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasShoulder(ITEMS.ICE_TIME.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.FROZEN_ORB.id) {
      this.casts += 1;
    }
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid === SPELLS.ICE_TIME_FROST_NOVA.id) {
      this.hits += 1;
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  item() {
    const averageDamage = (this.damage / this.hits) || 0;
    return {
      item: ITEMS.ICE_TIME,
      result: (
        <dfn data-tip={`Over <b>${this.casts}</b> Frozen Orb casts, your Ice Time's proc hit <b>${this.hits}</b> targets for an average of <b>${formatNumber(averageDamage)}</b> each.`}>
          <ItemDamageDone amount={this.damage} />
        </dfn>
      ),
    };
  }
}

export default IceTime;
