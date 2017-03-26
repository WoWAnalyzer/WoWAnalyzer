import Module from 'Main/Parser/Module';
import { LIGHT_OF_THE_MARTYR_SPELL_ID } from 'Main/Parser/Constants';

export const MARAADS_DYING_BREATH_ITEM_ID = 144273;
const MARAADS_HEALING_BUFF_ID = 234862;
const MARAADS_HEALING_INCREASE_PER_STACK = 0.1;

class MaraadsDyingBreath extends Module {
  healing = 0;

  _lastHeal = null;

  on_heal(event) {
    if (this.owner.byPlayer(event)) {
      this.processHeal(event);
    }
  }
  on_removebuffstack(event) {
    if (!this.owner.toPlayer(event)) return;
    if (!this._lastHeal) return;

    // In the case of Maraad's Dying Breath each LotM can consumes the stacks of the buff remaining. So this event is only called once per buffed LotM. When the buff is removed it first calls a `removebuffstack` that removes all additional stacks from the buff before it calls a `removebuff`, `removebuffstack` is the only way we can find the amount of stacks it had.
    const stacks = event.stack + 1; // stacks is all the additional stacks, the buff itself is the original stack
    this._lastHeal.stacks = stacks;

    const amount = this._lastHeal.amount;
    const absorbed = this._lastHeal.absorbed || 0;
    const overheal = this._lastHeal.overheal || 0;
    const raw = amount + absorbed + overheal;
    const healingIncreaseFactor = 1 + stacks * MARAADS_HEALING_INCREASE_PER_STACK;
    const healingIncrease = raw - raw / healingIncreaseFactor;

    const effectiveHealing = Math.max(0, healingIncrease - overheal);

    this.healing += effectiveHealing;
  }
  // on_damage(event) {
  //
  // }
  on_beacon_heal({ beaconTransferEvent, matchedHeal }) {
    const spellId = matchedHeal.ability.guid;
    if (spellId !== LIGHT_OF_THE_MARTYR_SPELL_ID) {
      return;
    }
    const stacks = this._lastHeal.stacks;
    if (!stacks) {
      console.error('Expected last heal to contain stacks.');
      return;
    }

    const amount = beaconTransferEvent.amount;
    const absorbed = beaconTransferEvent.absorbed || 0;
    const overheal = beaconTransferEvent.overheal || 0;
    const raw = amount + absorbed + overheal;
    const healingIncreaseFactor = 1 + stacks * MARAADS_HEALING_INCREASE_PER_STACK;
    const healingIncrease = raw - raw / healingIncreaseFactor;

    const effectiveHealing = Math.max(0, healingIncrease - overheal);

    this.healing += effectiveHealing;
  }
  processHeal(event) {
    const spellId = event.ability.guid;
    if (spellId !== LIGHT_OF_THE_MARTYR_SPELL_ID) {
      return;
    }
    if (!this.owner.modules.buffs.hasBuff(MARAADS_HEALING_BUFF_ID)) {
      return;
    }

    this._lastHeal = event;
  }
}

export default MaraadsDyingBreath;
