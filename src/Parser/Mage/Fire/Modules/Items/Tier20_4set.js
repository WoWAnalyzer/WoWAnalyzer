import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import getDamageBonus from 'Parser/Mage/Shared/Modules/GetDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';

const CRITICAL_MASSIVE_DAMAGE_BONUS = 0.1;

// Flamestrike damage events don't always hit on identical timestamps, and same with Critical Massive removal after a cast, so we give it a short window
const TOLERANCE_WINDOW_MS = 100;

/**
 * Pyroblast and Flamestrike critical strikes increases the damage of your next Pyroblast or Flamestrike by 10% for 8 sec.
 *
 * The proc is a buff on the player which is unfortunately removed on cast rather than on damage.
 * The buff fall seems to always happen after the cast, so we can use that to tell the difference between buff consumed and buff expired.
 */
class Tier20_4set extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  lastCastTimestamp; // last cast timestamp of pyroblast or flamestrike... used close to buff falloff indicates proc consumed
  flamestrikeHitTimestamp; // used to associate multiple hits of same flamestrike cast
  boostNextHit = false; // set true when a proc has just been consumed, indicating next relevant damage event should be boosted
  totalProcs = 0;
  expiredProcs = 0;
  pyroblastProcs = 0;
  flamestrikeProcs = 0;
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.FIRE_MAGE_T20_4SET_BONUS_BUFF.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PYROBLAST.id || spellId === SPELLS.FLAMESTRIKE.id) {
      this.lastCastTimestamp = this.owner.currentTimestamp;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.CRITICAL_MASSIVE.id) {
      this.totalProcs += 1;
      if (this.lastCastTimestamp && this.lastCastTimestamp + TOLERANCE_WINDOW_MS > this.owner.currentTimestamp) {
        this.boostNextHit = true;
      } else {
        this.expiredProcs += 1;
      }
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PYROBLAST.id && this.boostNextHit) {
      this.damage += getDamageBonus(event, CRITICAL_MASSIVE_DAMAGE_BONUS);
      this.pyroblastProcs += 1;
      this.boostNextHit = false;
    } else if (spellId === SPELLS.FLAMESTRIKE.id) {
      if (this.boostNextHit) {
        this.damage += getDamageBonus(event, CRITICAL_MASSIVE_DAMAGE_BONUS);
        this.flamestrikeHitTimestamp = this.owner.currentTimestamp;
        this.flamestrikeProcs += 1;
        this.boostNextHit = false;
      } else if (this.flamestrikeHitTimestamp && this.flamestrikeHitTimestamp + TOLERANCE_WINDOW_MS > this.owner.currentTimestamp) {
        this.damage += getDamageBonus(event, CRITICAL_MASSIVE_DAMAGE_BONUS);
      }
    }
  }

  item() {
    const ppm = this.totalProcs / (this.owner.fightDuration / 1000 / 60);
    return {
      id: SPELLS.FIRE_MAGE_T20_4SET_BONUS_BUFF.id,
      icon: <SpellIcon id={SPELLS.FIRE_MAGE_T20_4SET_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.FIRE_MAGE_T20_4SET_BONUS_BUFF.id} icon={false} />,
      result: (
        <dfn data-tip={`You got <b>${this.totalProcs}</b> total procs (<b>${ppm.toFixed(1)} PPM</b>), consuming <b>${this.pyroblastProcs}</b> with Pyroblast, <b>${this.flamestrikeProcs}</b> with Flamestrike, and letting <b>${this.expiredProcs}</b> procs expire. The damage numbers do <b>not</b> account for the additional Ignite damage from the boosted Pyroblasts.`}>
          <ItemDamageDone amount={this.damage} />
        </dfn>
      ),
    };
  }
}

export default Tier20_4set;
