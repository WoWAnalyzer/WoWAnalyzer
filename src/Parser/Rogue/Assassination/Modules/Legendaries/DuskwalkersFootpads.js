import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

// Equip: The remaining cooldown on Vendetta is reduced by 1 sec for every 65 Energy you expend.

class DuskwalkersFootpads extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
      };

  vendettaCDReduction = 1;
  totalReduction = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasFeet(ITEMS.DUSKWALKERS_FOOTPADS.id);
  }

  on_byPlayer_spendresource(event) {
    if (event.resourceChangeType !== RESOURCE_TYPES.ENERGY.id) return;
    if (!this.spellUsable.isOnCooldown(SPELLS.VENDETTA.id)) return;

    const spent = event.resourceChange;

    this.totalReduction += (spent / 65) * this.vendettaCDReduction;
  }

  item() {
    return {
      item: ITEMS.DUSKWALKERS_FOOTPADS,
      result: <Wrapper><SpellLink id={SPELLS.VENDETTA.id}/> cooldown reduced by {this.totalReduction.toFixed(1)} seconds.</Wrapper>,
    };
  }
}

export default DuskwalkersFootpads;
