import React from 'react';

import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink';
import Enemies from 'Parser/Core/Modules/Enemies';

/**
 * Helbrine, Rope of the Mist Marauder
 * Equip: The first time Harpoon hits a target, your damage done to the target is increased by up to 30% for until cancelled based on distance to the target.
 */
//TODO - do damage calculations for Helbrine based on positioning after in-game testing (if possible at all)
class HelbrineRopeOfTheMistMarauder extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  applications = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWaist(ITEMS.HELBRINE_ROPE_OF_THE_MIST_MARAUDER.id);
  }

  get uptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.MARK_OF_HELBRINE.id) / this.owner.fightDuration;
  }

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MARK_OF_HELBRINE.id) {
      return;
    }
    this.applications++;
  }

  item() {
    return {
      item: ITEMS.HELBRINE_ROPE_OF_THE_MIST_MARAUDER,
      result: (
        <dfn data-tip={`You applied the Mark of Helbrine debuff ${this.applications} times.`}>
          <Wrapper>You had {formatPercentage(this.uptimePercentage)}% uptime on <SpellLink id={SPELLS.MARK_OF_HELBRINE.id} />.</Wrapper>
        </dfn>
      ),
    };
  }
}

export default HelbrineRopeOfTheMistMarauder;
