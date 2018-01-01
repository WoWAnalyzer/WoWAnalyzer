import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemDamageDone from 'Main/ItemDamageDone';

// Spear appears to be kinda slow, saw hits from same spear seperated by upto a half second. Setting to full second to be safe.
const HIT_WINDOW_MS = 1000;

/*
 * Sceptral Thurible -
 * Equip: Your ranged attacks and spells have a chance to conjure a Spear of Anguish. After 3 sec the spear launches towards its target, dealing 294407 Shadow damage to all enemies it passes through.
 */
class SpectralThurible extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;
  procs = 0;
  hits = 0;
  hitTimestamp;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.SPECTRAL_THURIBLE.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.SPECTRAL_THURIBLE_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
    
    this.hits += 1;
    if(!this.hitTimestamp || this.hitTimestamp + HIT_WINDOW_MS < this.owner.currentTimestamp) {
      this.hitTimestamp = this.owner.currentTimestamp;
      this.procs += 1;
    }
  }

  get averageHits() {
    return this.hits / this.procs;
  }

  item() {
    return {
      item: ITEMS.SPECTRAL_THURIBLE,
      result: (
				<dfn data-tip={`You hit an average of <b>${this.averageHits.toFixed(1)}</b> targets per proc`}>
					<ItemDamageDone amount={this.damage} />
				</dfn>
			),
    };
  }
}

export default SpectralThurible;
