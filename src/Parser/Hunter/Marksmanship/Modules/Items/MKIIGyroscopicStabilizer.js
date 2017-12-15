import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/*
 * Equip: Your Aimed Shot grants you gyroscopic stabilization, increasing the critical strike chance of your next Aimed Shot by 15% and making it castable while moving.
 */
class MKIIGyroscopicStabilizer extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  usedBuffs = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasHands(ITEMS.MKII_GYROSCOPIC_STABILIZER.id);
  }
  on_byPlayer_removebuff(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.GYROSCOPIC_STABILIZATION.id) {
      return;
    }
    this.usedBuffs += 1;
  }

  item() {
    return {
      item: ITEMS.MKII_GYROSCOPIC_STABILIZER,
      result: <span>This allowed you to move while casting {this.usedBuffs} <SpellLink id={SPELLS.AIMED_SHOT.id} />s  throughout the fight, these <SpellLink id={SPELLS.AIMED_SHOT.id} />s also had 15% increased crit chance.</span>,
    };
  }
}

export default MKIIGyroscopicStabilizer;
