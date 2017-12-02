import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatThousands } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

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
        <dfn data-tip={`The exact amount of mana gained from the Amalgam's Seventh Spine equip effect. The buff expired successfully ${this.procs} times and the buff was refreshed ${this.refreshes} times (refreshing delays the buff expiration and is inefficient use of this trinket).`}>
          {formatThousands(this.manaGained)} mana gained ({formatThousands(this.manaGained / this.owner.fightDuration * 1000 * 5)} MP5)
        </dfn>
      ),
    };
  }
  // TODO: Suggest upon refreshing often to not do that
}

export default AmalgamsSeventhSpine;
