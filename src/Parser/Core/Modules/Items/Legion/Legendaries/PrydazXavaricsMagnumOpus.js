import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import ItemHealingDone from 'Interface/Others/ItemHealingDone';

/**
 * Prydaz, Xavaric's Magnum Opus -
 * Equip: Every 30 sec, gain an absorb shield for 25% of your maximum health for 30 sec.
 */
class PrydazXavaricsMagnumOpus extends Analyzer {
  healing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasNeck(ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS.id);
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.XAVARICS_MAGNUM_OPUS.id) {
      this.healing += event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS,
      result: <ItemHealingDone amount={this.healing} />,
    };
  }
}

export default PrydazXavaricsMagnumOpus;
