import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatMilliseconds } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

const MARAADS_HEALING_INCREASE_PER_STACK = 0.1;

const debug = false;

class MaraadsDyingBreath extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  totalHealing = 0;
  healingGainOverFol = 0;
  healingGainOverLotm = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBack(ITEMS.MARAADS_DYING_BREATH.id);
  }

  _lastHeal = null;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_THE_MARTYR.id) {
      return;
    }
    if (!this.combatants.selected.hasBuff(SPELLS.MARAADS_DYING_BREATH_BUFF.id, event.timestamp)) {
      debug && console.warn(formatMilliseconds(event.timestamp - this.owner.fight.start_time), 'Maraads: LotM without buff', event);
      return;
    }

    this._lastHeal = event;
    debug && console.log(formatMilliseconds(event.timestamp - this.owner.fight.start_time), 'Maraads: LotM heal', event);
  }
  on_toPlayer_removebuff(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.MARAADS_DYING_BREATH_BUFF.id) {
      return;
    }
    if (!this._lastHeal) {
      debug && console.warn(formatMilliseconds(event.timestamp - this.owner.fight.start_time), 'Maraads: Buff disappeared without LotM heal', event);
      return;
    }

    // In the case of Maraad's Dying Breath each LotM consumes the stacks of the buff remaining. So this event is only called once per buffed LotM. When the buff is removed it first calls a `removebuffstack` that removes all additional stacks from the buff before it calls a `removebuff`, `removebuffstack` is the only way we can find the amount of stacks it had.
    const heal = this._lastHeal;
    const buff = this.combatants.selected.getBuff(SPELLS.MARAADS_DYING_BREATH_BUFF.id, heal.timestamp);
    const stacks = buff && buff.stacks ? (buff.stacks + 1) : 1;

    debug && console.log(formatMilliseconds(event.timestamp - this.owner.fight.start_time), 'Maraads: Stacks at LotM heal:', stacks, event);

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
  on_beacon_heal(event) {
    const spellId = event.originalHeal.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_THE_MARTYR.id) {
      return;
    }
    // Without Maraad's LotM doesn't beacon transfer, so the entire heal counts towards Maraad's bonus.
    const healing = event.amount + (event.absorbed || 0);

    this.totalHealing += healing;
    this.healingGainOverLotm += healing;

    const buff = this.combatants.selected.getBuff(SPELLS.MARAADS_DYING_BREATH_BUFF.id, event.originalHeal.timestamp);
    const stacks = buff && buff.stacks ? (buff.stacks + 1) : 1;

    debug && console.log(formatMilliseconds(event.timestamp - this.owner.fight.start_time), 'Maraads: beacon transfer: Stacks at LotM heal:', stacks);

    // Since FoL beacon transfers, the only gain from Maraad's over a FoL would be the increase from Maraad's to beacon transfer
    this.healingGainOverFol += calculateEffectiveHealing(event, stacks * MARAADS_HEALING_INCREASE_PER_STACK);
  }
  // Maraad's doesn't increase damage taken, so we can ignore that part
  on_toPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_THE_MARTYR_DAMAGE_TAKEN.id) {
      return;
    }
    if (!this.combatants.selected.hasBuff(SPELLS.MARAADS_DYING_BREATH_BUFF.id, event.timestamp)) {
      return;
    }

    const effectiveDamage = event.amount + (event.absorbed || 0);

    this.totalHealing -= effectiveDamage;
    this.healingGainOverFol -= effectiveDamage;
  }

  item() {
    return {
      item: ITEMS.MARAADS_DYING_BREATH,
      result: (
        <dfn
          data-tip={`
            This is the estimated effective healing gain by Maraad's. This takes the full opportunity cost of casting a Flash of Light into account as well as the mana saved (converted to HPS) from the difference in mana costs. The only thing not accounted for is the reduction in cast time.<br /><br />

            The effective healing done from Maraad's when adjusted for the opportunity cost of casting an unbuffed Light of the Martyr was ${this.owner.formatItemHealingDone(this.healingGainOverLotm)}. This is the highest value you should consider Maraad's to be worth, but even then it is overvalued as you wouldn't cast a Light of the Martyr without Maraad's (unless absolute necessary) as it's ineffective. Instead you would cast a Flash of Light or Holy Light, and so ≈${this.owner.formatItemHealingDone(this.healingGainOverFol)} is likely much closer to your actual healing gain from Maraad's.<br /><br />

            The total healing done with Light of the Martyr affected by Maraad's Dying Breath was ${this.owner.formatItemHealingDone(this.totalHealing)}. This does not consider any opportunity cost (so it assumes you would have cast <b>nothing</b> in place of the buffed Light of The Martyr). The damage taken from Light of the Martyr was taken into account in this number.
          `}
        >
          <ItemHealingDone amount={this.healingGainOverFol} approximate />
        </dfn>
      ),
    };
  }
}

export default MaraadsDyingBreath;
