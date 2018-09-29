import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/core/modules/SpellUsable';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellLink from 'common/SpellLink';

const VENDETTA_CDR_PER_ENERGY = 1 / 65;

/**
* Equip: The remaining cooldown on Vendetta is reduced by 1 sec for every 65 Energy you expend.
*/
class DuskwalkersFootpads extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  totalReduction = 0;
  wastedReduction = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasFeet(ITEMS.DUSKWALKERS_FOOTPADS.id);
  }

  on_byPlayer_spendresource(event) {
    if (event.resourceChangeType !== RESOURCE_TYPES.ENERGY.id || event.ability.guid === SPELLS.FEINT.id) {
      return;
    }

    const spent = event.resourceChange;
    const potentialReduction = spent * VENDETTA_CDR_PER_ENERGY;

    if (this.spellUsable.isOnCooldown(SPELLS.VENDETTA.id)) {
      const reduced = this.spellUsable.reduceCooldown(SPELLS.VENDETTA.id, potentialReduction * 1000) / 1000;

      this.totalReduction += reduced;
      this.wastedReduction += potentialReduction - reduced;
    } else {
      this.wastedReduction += potentialReduction;
    }

  }

  item() {
    return {
      item: ITEMS.DUSKWALKERS_FOOTPADS,
      result: (
      <dfn data-tip={`You wasted ${this.wastedReduction.toFixed(1)} seconds of cooldown reduction.`}>
        Reduced <SpellLink id={SPELLS.VENDETTA.id} /> cooldown by {this.totalReduction.toFixed(1)} seconds.
      </dfn>
      ),
    };
  }
}

export default DuskwalkersFootpads;
