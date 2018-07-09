import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';

/**
 * Unseen Predator's Cloak
 * Equip: Gain 10% increased critical strike chance against enemies burning from your Explosive Trap.
 */
class UnseenPredatorsCloak extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasBack(ITEMS.UNSEEN_PREDATORS_CLOAK.id);
  }

  get uptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.UNSEEN_PREDATORS_CLOAK_BUFF.id) / this.owner.fightDuration;
  }

  item() {
    return {
      item: ITEMS.UNSEEN_PREDATORS_CLOAK,
      result: <React.Fragment>{formatPercentage(this.uptimePercentage)}% uptime</React.Fragment>,
    };
  }
}

export default UnseenPredatorsCloak;
