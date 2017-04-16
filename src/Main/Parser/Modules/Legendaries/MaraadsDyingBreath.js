import Module from 'Main/Parser/Module';
import { LIGHT_OF_THE_MARTYR_SPELL_ID } from 'Main/Parser/Constants';

export const MARAADS_DYING_BREATH_ITEM_ID = 144273;
const MARAADS_HEALING_BUFF_ID = 234862;
const MARAADS_HEALING_INCREASE_PER_STACK = 0.1;

class MaraadsDyingBreath extends Module {
  healing = 0;

  _lastHeal = null;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== LIGHT_OF_THE_MARTYR_SPELL_ID) {
      return;
    }
    if (!this.owner.selectedCombatant.hasBuff(MARAADS_HEALING_BUFF_ID)) {
      return;
    }

    this._lastHeal = event;
  }
  on_toPlayer_removebuff(event) {
    const buffId = event.ability.guid;
    if (buffId !== MARAADS_HEALING_BUFF_ID) return;
    if (!this._lastHeal) return;

    // In the case of Maraad's Dying Breath each LotM can consumes the stacks of the buff remaining. So this event is only called once per buffed LotM. When the buff is removed it first calls a `removebuffstack` that removes all additional stacks from the buff before it calls a `removebuff`, `removebuffstack` is the only way we can find the amount of stacks it had.
    const heal = this._lastHeal;
    const buff = this.owner.selectedCombatant.getBuff(MARAADS_HEALING_BUFF_ID);
    const stacks = buff.stacks || 1;

    const amount = heal.amount;
    const absorbed = heal.absorbed || 0;
    const overheal = heal.overheal || 0;
    const raw = amount + absorbed + overheal;
    const healingIncreaseFactor = 1 + stacks * MARAADS_HEALING_INCREASE_PER_STACK;
    const healingIncrease = raw - raw / healingIncreaseFactor;

    const effectiveHealing = Math.max(0, healingIncrease - overheal);

    this.healing += effectiveHealing;

    // One heal per buff
    this._lastHeal = null;
  }
  on_beacon_heal({ beaconTransferEvent, matchedHeal }) {
    const spellId = matchedHeal.ability.guid;
    if (spellId !== LIGHT_OF_THE_MARTYR_SPELL_ID) {
      return;
    }
    // Without Maraad's LotM doesn't beacon transfer, so the entire heal counts towards Maraad's bonus.

    const amount = beaconTransferEvent.amount;
    const absorbed = beaconTransferEvent.absorbed || 0;

    const effectiveHealing = amount + absorbed;

    this.healing += effectiveHealing;
  }
  // Maraad's doesn't increase damage taken, so we can ignore that part
  // on_damage(event) {
  // }
}

export default MaraadsDyingBreath;
