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
 * Unseen Predator's Cloak
 * Equip: Gain 10% increased critical strike chance against enemies burning from your Explosive Trap.
 */
class UnseenPredatorsCloak extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasBack(ITEMS.UNSEEN_PREDATORS_CLOAK.id);
  }

  get uptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.UNSEEN_PREDATORS_CLOAK_BUFF.id) / this.owner.fightDuration;
  }

  item() {
    return {
      item: ITEMS.UNSEEN_PREDATORS_CLOAK,
      result: <Wrapper>You had {formatPercentage(this.uptimePercentage)}% uptime on <SpellLink id={SPELLS.UNSEEN_PREDATORS_CLOAK_BUFF.id} />.</Wrapper>,
    };
  }
}

export default UnseenPredatorsCloak;
