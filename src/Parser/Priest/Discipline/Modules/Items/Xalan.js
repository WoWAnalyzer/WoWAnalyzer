import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import ItemHealingDone from 'Main/ItemHealingDone';

import isAtonement from '../Core/isAtonement';

const debug = false;

class Xalan extends Analyzer {
  healing = 0;

  get atonementDuration() {
    return 15;
  }

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasHands(ITEMS.XALAN_THE_FEAREDS_CLENCH.id);
  }

  lastAtonmentAppliedTimestamp = null;
  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ATONEMENT_BUFF.id) {
      return;
    }
    if (!this.owner.toPlayer(event)) {
      return;
    }
    this.lastAtonmentAppliedTimestamp = event.timestamp;
  }
  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.ATONEMENT_BUFF.id) {
      return;
    }
    if (!this.owner.toPlayer(event)) {
      return;
    }
    this.lastAtonmentAppliedTimestamp = event.timestamp;
  }

  on_byPlayer_heal(event) {
    if (!isAtonement(event)) {
      return;
    }
    if (!this.owner.toPlayer(event)) {
      return;
    }
    if (this.lastAtonmentAppliedTimestamp === null) {
      // This can be `null` when Atonement wasn't applied in the combatlog. This often happens as Discs like to apply Atonement prior to combat.
      this.lastAtonmentAppliedTimestamp = this.owner.fight.start_time;
      debug && console.warn('Xalan: was applied prior to combat');
    }

    if ((event.timestamp - this.lastAtonmentAppliedTimestamp) < (this.atonementDuration * 1000)) {
      return;
    }

    debug && console.log('Xalan:', event.amount + (event.absorbed || 0), 'healing done');
    this.healing += event.amount + (event.absorbed || 0);
  }

  item() {
    const healing = this.healing || 0;

    return {
      item: ITEMS.XALAN_THE_FEAREDS_CLENCH,
      result: <ItemHealingDone amount={healing} />,
    };
  }
}

export default Xalan;
