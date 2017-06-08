import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const MARAADS_HEALING_BUFF_ID = 234862;
const MARAADS_HEALING_INCREASE_PER_STACK = 0.1;

class MaraadsDyingBreath extends Module {
  totalHealing = 0;
  healingGainOverFol = 0;
  healingGainOverLotm = 0;

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
    if (buffId !== MARAADS_HEALING_BUFF_ID) {
      return;
    }
    if (!this._lastHeal) {
      return;
    }

    // In the case of Maraad's Dying Breath each LotM consumes the stacks of the buff remaining. So this event is only called once per buffed LotM. When the buff is removed it first calls a `removebuffstack` that removes all additional stacks from the buff before it calls a `removebuff`, `removebuffstack` is the only way we can find the amount of stacks it had.
    const heal = this._lastHeal;
    const buff = this.owner.selectedCombatant.getBuff(MARAADS_HEALING_BUFF_ID, event.timestamp);
    const stacks = buff.stacks || 1;

    const amount = heal.amount;
    const absorbed = heal.absorbed || 0;
    const overheal = heal.overheal || 0;
    const healing = amount + absorbed;
    const raw = amount + absorbed + overheal;

    this.totalHealing += healing;
    const effectiveHealing = calculateEffectiveHealing(heal, stacks * MARAADS_HEALING_INCREASE_PER_STACK);
    this.healingGainOverLotm += effectiveHealing;

    const rawBaseLotmHeal = raw - (raw / (1 + stacks * MARAADS_HEALING_INCREASE_PER_STACK));
    // 50% of the base LotM heal is considered the value of the mana difference between casting a LotM instead of a FoL.
    const estimatedManaValue = rawBaseLotmHeal * 0.5;

    this.healingGainOverFol += effectiveHealing + estimatedManaValue;

    // One heal per buff
    this._lastHeal = null;
  }
  on_beacon_heal({ beaconTransferEvent, matchedHeal }) {
    const spellId = matchedHeal.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_THE_MARTYR.id) {
      return;
    }
    // Without Maraad's LotM doesn't beacon transfer, so the entire heal counts towards Maraad's bonus.
    const healing = beaconTransferEvent.amount + (beaconTransferEvent.absorbed || 0);

    this.totalHealing += healing;
    this.healingGainOverLotm += healing;

    const buff = this.owner.selectedCombatant.getBuff(MARAADS_HEALING_BUFF_ID, matchedHeal.timestamp);
    const stacks = buff.stacks || 1;

    // Since FoL beacon transfers, the only gain from Maraad's over a FoL would be the increase from Maraad's to beacon transfer
    this.healingGainOverFol += calculateEffectiveHealing(beaconTransferEvent, stacks * MARAADS_HEALING_INCREASE_PER_STACK);
  }
  // Maraad's doesn't increase damage taken, so we can ignore that part
  on_toPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_THE_MARTYR_DAMAGE_TAKEN.id) {
      return;
    }
    if (!this.owner.selectedCombatant.hasBuff(MARAADS_HEALING_BUFF_ID, event.timestamp)) {
      return;
    }

    const effectiveDamage = event.amount + (event.absorbed || 0);

    this.totalHealing -= effectiveDamage;
    this.healingGainOverFol -= effectiveDamage;
  }
}

export default MaraadsDyingBreath;
