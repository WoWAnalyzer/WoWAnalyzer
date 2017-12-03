import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/*
 * Amalgam's Seventh Spine -
 * Equip: Your direct healing spells apply and refresh Fragile Echo for 6 sec. When Fragile Echo expires, it restores 3840 mana to you.
 */
class AmalgamsSeventhSpine extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  manaGained = 0;
  procs = 0;
  applications = 0;
  refreshes = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.AMALGAMS_SEVENTH_SPINE.id);
  }

  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FRAGILE_ECHO_ENERGIZE.id) {
      return;
    }

    this.manaGained += event.resourceChange;
    this.procs += 1;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FRAGILE_ECHO_BUFF.id) {
      return;
    }

    this.applications += 1;
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FRAGILE_ECHO_BUFF.id) {
      return;
    }

    this.refreshes += 1;
  }

  item() {
    return {
      item: ITEMS.AMALGAMS_SEVENTH_SPINE,
      result: (
        <dfn data-tip={`The buff expired and restored mana ${this.procs} times and was refreshed ${this.refreshes} times. (refreshing delays the buff expiration and is an inefficient use of this trinket).`}>
          {this.owner.formatManaRestored(this.manaGained)}
        </dfn>
      ),
    };
  }
  // TODO: Suggest upon refreshing often to not do that
}

export default AmalgamsSeventhSpine;
