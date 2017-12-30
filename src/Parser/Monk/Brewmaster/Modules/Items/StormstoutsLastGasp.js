import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

// multiplying the damage dealt by this factor gives the damage dealt by
// shoulders
//
// note that this is NOT just 0.25
const KEG_SMASH_DMG_FACTOR = 0.2;

/**
 * The Brewmaster legendary shoulders, Stormstout's Last Gasp.
 *
 * Grants an additional charge to Keg Smash, and increases Keg Smash
 * damage by 25%. 
 */ 
class StormstoutsLastGasp extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  _directDamage = 0;
  _extraCastDamage = 0;

  get damage() {
    return this._directDamage + this._extraCastDamage;
  }

  on_initialized() {
    this.active = this.combatants.selected.hasShoulder(ITEMS.STORMSTOUTS_LAST_GASP.id);
  }

  on_byPlayer_cast() {
    // TODO
  }

  on_byPlayer_damage(event) {
    if(event.ability.guid === SPELLS.KEG_SMASH.id) {
      this._directDamage += KEG_SMASH_DMG_FACTOR * event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.STORMSTOUTS_LAST_GASP,
      result: (
        <dfn data-tip={`Keg Smash dealt an additional <b>${formatNumber(this.damage)}</b> damage due to Stormstout's Last Gasp.<br/>Additional casts are not considered at this time.`}>{this.owner.formatItemDamageDone(this.damage)}</dfn>
      ),
    };
  }
}

export default StormstoutsLastGasp;
