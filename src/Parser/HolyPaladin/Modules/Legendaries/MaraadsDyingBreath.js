import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const MARAADS_HEALING_BUFF_ID = 234862;
const MARAADS_HEALING_INCREASE_PER_STACK = 0.1;

class MaraadsDyingBreath extends Module {
  healing = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasBack(ITEMS.MARAADS_DYING_BREATH.id);
    }
  }

  _lastHeal = null;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_THE_MARTYR.id) {
      return;
    }
    if (!this.owner.selectedCombatant.hasBuff(MARAADS_HEALING_BUFF_ID, event.timestamp)) {
      return;
    }

    this._lastHeal = event;
  }
  on_toPlayer_removebuff(event) {
    const buffId = event.ability.guid;
    if (buffId !== MARAADS_HEALING_BUFF_ID) return;
    if (!this._lastHeal) return;

    // In the case of Maraad's Dying Breath each LotM consumes the stacks of the buff remaining. So this event is only called once per buffed LotM. When the buff is removed it first calls a `removebuffstack` that removes all additional stacks from the buff before it calls a `removebuff`, `removebuffstack` is the only way we can find the amount of stacks it had.
    const heal = this._lastHeal;
    const buff = this.owner.selectedCombatant.getBuff(MARAADS_HEALING_BUFF_ID, event.timestamp);
    const stacks = buff.stacks || 1;

    this.healing += calculateEffectiveHealing(heal, stacks * MARAADS_HEALING_INCREASE_PER_STACK);

    // One heal per buff
    this._lastHeal = null;
  }
  on_beacon_heal({ beaconTransferEvent, matchedHeal }) {
    const spellId = matchedHeal.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_THE_MARTYR.id) {
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
