import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatMilliseconds, formatNumber } from 'common/format';
import getDamageBonus from 'Parser/Mage/Shared/Modules/GetDamageBonus';

const BONUS_DAMAGE = 3;
const CAST_BUFFER = 250;

const debug = false;

class MarqueeBindingsOfTheSunKing extends Analyzer {

  static dependencies = {
		combatants: Combatants,
	};

  damage = 0;
  beginCastTimestamp = 0;
  castTimestamp = 0;
  hasBindingsBuff = false;
  buffUsed = false;
  isBuffed = false;
  beginCastFound = false;
  count = 0;
  wastedProcs = 0;
  usedProcs = 0;
  totalProcs = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.MARQUEE_BINDINGS_OF_THE_SUN_KING.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.KAELTHAS_ULTIMATE_ABILITY.id) {
      return;
    }
    this.hasBindingsBuff = true;
    this.buffUsed = false;
    this.totalProcs += 1;
    this.buffAppliedTimestamp = event.timestamp;
    debug && console.log("Buff Applied @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.KAELTHAS_ULTIMATE_ABILITY.id) {
      return;
    }
    this.hasBindingsBuff = true;
    this.buffUsed = false;
    this.wastedProcs += 1;
    this.totalProcs += 1;
    debug && console.log("Buff Refreshed " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.KAELTHAS_ULTIMATE_ABILITY.id) {
      return;
    }
    this.hasBindingsBuff = false;
    debug && console.log("Buff Removed @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    if (this.buffUsed === false) {
      this.wastedProcs += 1;
      debug && console.log("Buff Expired @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    } else {
      this.usedProcs += 1;
    }
  }

  on_byPlayer_begincast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROBLAST.id) {
      return;
    }
    this.beginCastTimestamp = event.timestamp;
    this.beginCastFound = true;

    debug && console.log("Pyroblast Begin Cast @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROBLAST.id || this.beginCastFound === false) {
      return;
    }
    this.beginCastFound = false;
    debug && console.log("Pyroblast Casted @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    this.castTimestamp = event.timestamp;
    const castTime = this.castTimestamp - this.beginCastTimestamp;
    if (castTime >= CAST_BUFFER && this.hasBindingsBuff === true) {
      this.isBuffed = true;
      this.buffUsed = true;
      debug && console.log("Buff Used @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.PYROBLAST.id) {
      return;
    }
      if (this.isBuffed === true) {
        this.damage += getDamageBonus(event, BONUS_DAMAGE);
        this.isBuffed = false;
        debug && console.log("Pyroblast Damage @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
      } else {
        debug && console.log("Non Buffed Pyroblast Damage @ " + formatMilliseconds(event.timestamp - this.owner.fight.start_time));
      }
  }

  get avgBonusDamage() {
    return this.damage / this.usedProcs;
  }

  on_finished() {
    if (this.combatants.selected.hasBuff(SPELLS.KAELTHAS_ULTIMATE_ABILITY.id)) {
      const adjustedFightEnding = this.owner.currentTimestamp - 5000;
      if (this.buffAppliedTimestamp < adjustedFightEnding) {
        this.wastedProcs += 1;
        debug && console.log("Fight Ended with Unused Proc @ " + formatMilliseconds(this.owner.currentTimestamp - this.owner.fight.start_time));
      } else {
        this.totalProcs -= 1;
      }
    }
  }

  item() {
    return {
      item: ITEMS.MARQUEE_BINDINGS_OF_THE_SUN_KING,
      result: (
        <dfn data-tip={`${this.totalProcs} Total Procs
        <ul>
          <li>${this.usedProcs} Procs Used</li>
          <li>${this.wastedProcs} Procs Wasted</li>
          <li>${formatNumber(this.avgBonusDamage)} Average Bonus Damage</li>
        </ul>
        `}>
          {this.owner.formatItemDamageDone(this.damage)}
        </dfn>
      ),
    };
  }
}

export default MarqueeBindingsOfTheSunKing;
