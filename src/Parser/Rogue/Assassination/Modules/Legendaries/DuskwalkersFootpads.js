import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import SpellLink from 'common/SpellLink';

/*
* Equip: The remaining cooldown on Vendetta is reduced by 1 sec for every 65 Energy you expend.
*/

const VENDETTA_CDR_PER_ENERGY = 1/65;

class DuskwalkersFootpads extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
      };

  totalReduction = 0;
  wastedReduction = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasFeet(ITEMS.DUSKWALKERS_FOOTPADS.id);
  }

  on_byPlayer_spendresource(event) {
    if (event.resourceChangeType !== RESOURCE_TYPES.ENERGY.id
        || event.ability.guid === SPELLS.FEINT.id) {
      return;
    }

    const spent = event.resourceChange;

    const reduction = spent * VENDETTA_CDR_PER_ENERGY;


    if (!this.spellUsable.isOnCooldown(SPELLS.VENDETTA.id)) {
      this.wastedReduction += reduction;
    } else {

      this.spellUsable.reduceCooldown(SPELLS.VENDETTA.id, reduction * 1000);

      this.totalReduction += reduction;

    }
  }

  item() {
    return {
      item: ITEMS.DUSKWALKERS_FOOTPADS,
      result: (
      <dfn data-tip={`You wasted ${this.wastedReduction.toFixed(1)} seconds of cooldown reduction.`}>
        Reduced <SpellLink id={SPELLS.VENDETTA.id} icon /> cooldown by {this.totalReduction.toFixed(1)} seconds.
      </dfn>
      ),
    };
  }
}

export default DuskwalkersFootpads;
