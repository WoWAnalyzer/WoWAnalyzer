import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/*
 * Highfathers Machination -
 * Equip: Your healing effects have a chance to apply a charge of Highfather's Timekeeping for 1 min, max 5 charges. When the ally falls below 50% health, Highfather's Timekeeping is consumed to instantly heal them for 216140 health per charge.
 */
class HighfathersMachination extends Analyzer {
  static dependencies = {
      combatants: Combatants,
  };

  healing = 0;

  proccedCharges = 0;
  expiredCharges = 0;
  activeCharges = 0;

  // tracks last number of stacks per player (to figure out how many stacks heal was for)
  charges = {};

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.HIGHFATHERS_MACHINATION.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HIGHFATHERS_TIMEKEEPING_HEAL.id) {
      return;
    }

    this.healing += (event.amount || 0) + (event.absorbed || 0);

    const targetId = event.targetID;
    if (!targetId || !this.charges[targetId]) {
      console.warn("Highfather's Timekeeping healed targetId " + targetId + " with no record of a charge on that target");
      return;
    }
    const chargesOnTarget = this.charges[targetId];
    this.proccedCharges += chargesOnTarget;
    this.expiredCharges -= chargesOnTarget;
  }

  on_byPlayer_changebuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HIGHFATHERS_TIMEKEEPING_BUFF.id) {
      return;
    }

    this.activeCharges += (event.newStacks - event.oldStacks);
    if(event.newStacks === 0) {
      this.expiredCharges += event.oldStacks;
    } else {
      const targetId = event.targetID;
      if (!targetId) {
        console.warn("Highfather's Timekeeping applied to target without an ID???");
        return;
      }
      this.charges[targetId] = event.newStacks;
    }
  }

  get totalCharges() {
    return this.expiredCharges + this.proccedCharges + this.activeCharges;
  }

  item() {
    return {
      item: ITEMS.HIGHFATHERS_MACHINATION,
      result: (
        <dfn data-tip={`You applied <b>${this.totalCharges}</b> healing charges.
        <ul>
          <li>Procced: <b>${this.proccedCharges}</b></li>
          <li>Expired: <b>${this.expiredCharges}</b></li>
          <li>Active at encounter's end: <b>${this.activeCharges}</b></li>
        </ul>
        `}>
        {this.owner.formatItemHealingDone(this.healing)}
        </dfn>),
    };
  }
}

export default HighfathersMachination;
