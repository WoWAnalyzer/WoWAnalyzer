import React from 'react';
import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';

import Analyzer from 'parser/core/Analyzer';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import ItemHealingDone from 'interface/others/ItemHealingDone';

/**
 * Equip: Your attacks and attacks made against you have a chance to trigger spores to grow for 4 sec before bursting.
 * When they burst, they restore [x] health to you and deal [y] damage split among enemies within 8 yds.
 * 
 * The growing spores buff is always applied to the player.
 * It's possible to get a second proc while the "growing spores" buff is already active. In that case
 * the old buff is triggered early, does its damage and healing, and is replaced by the new buff.
 * In short: overlapping procs are not wasted.
 */
class LingeringSporepods extends Analyzer {
  damage = 0;
  healing = 0;
  totalProcs = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.LINGERING_SPOREPODS.id);
  }

  on_toPlayer_applybuff(event) {
    if (SPELLS.LINGERING_SPOREPODS_BUFF.id !== event.ability.guid) {
      return;
    }
    this.totalProcs += 1;
  }

  on_toPlayer_refreshbuff(event) {
    if (SPELLS.LINGERING_SPOREPODS_BUFF.id !== event.ability.guid) {
      return;
    }
    this.totalProcs += 1;
  }

  on_byPlayer_damage(event) {
    if (SPELLS.LINGERING_SPOREPODS_DAMAGE.id !== event.ability.guid) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  on_byPlayer_heal(event) {
    if (SPELLS.LINGERING_SPOREPODS_HEAL.id !== event.ability.guid) {
      return;
    }
    this.healing += (event.amount || 0) + (event.absorbed || 0);
  }
  
  item() {
    return {
      item: ITEMS.LINGERING_SPOREPODS,
      result: (
        <dfn data-tip={`Procced <b>${this.totalProcs}</b> time${this.totalProcs === 1 ? '' : 's'}.`}>
          <ItemDamageDone amount={this.damage} /><br />
          <ItemHealingDone amount={this.healing} />
        </dfn>
      ),
    };
  }
}

export default LingeringSporepods;
