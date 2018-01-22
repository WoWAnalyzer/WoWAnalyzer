import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemDamageDone from 'Main/ItemDamageDone';
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';

const TIER_21_4P_DMG_INCREASE_PER_STACK = 0.2;

/**
 * Each cast of Mongoose Bite increases the damage of your next Raptor Strike by 20%. Stacks up to 6 times.
 */
class Tier21_4p extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;
  _currentStacks = 0;
  buffsApplied = 0;
  buffsUsed = 0;
  timesRemoved = 0;
  possibleBuffs = 0;
  expiredBuffs = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HUNTER_SV_T21_4P_BONUS.id);
  }
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MONGOOSE_BITE.id) {
      return;
    }
    this.possibleBuffs++;
  }
  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HUNTER_SV_T21_4P_BONUS_BUFF.id) {
      return;
    }
    this._currentStacks = 1;
    this.buffsApplied++;
  }
  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HUNTER_SV_T21_4P_BONUS_BUFF.id) {
      return;
    }
    this._currentStacks++;
    this.buffsApplied++;
  }
  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.HUNTER_SV_T21_4P_BONUS_BUFF.id) {
      return;
    }
    if (this._currentStacks > 0) {
      this.expiredBuffs++;
    }
  }
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.RAPTOR_STRIKE.id) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.HUNTER_SV_T21_4P_BONUS_BUFF.id, event.timestamp)) {
      this.bonusDmg += getDamageBonus(event, TIER_21_4P_DMG_INCREASE_PER_STACK * this._currentStacks);
      this.buffsUsed += this._currentStacks;
      this._currentStacks = 0;
      this.timesRemoved++;
    }
  }

  item() {
    return {
      id: `spell-${SPELLS.HUNTER_SV_T21_4P_BONUS.id}`,
      icon: <SpellIcon id={SPELLS.HUNTER_SV_T21_4P_BONUS.id} />,
      title: <SpellLink id={SPELLS.HUNTER_SV_T21_4P_BONUS.id} />,
      result: (
        <dfn data-tip={`
          Your average buffed raptor strike consumed ${(this.buffsUsed / this.timesRemoved).toFixed(1)} stacks. <br/>
          You generated ${formatPercentage(this.buffsApplied / this.possibleBuffs)}% of possible buffs through mongoose bite.<br/>
          You consumed ${formatPercentage(this.buffsUsed / this.buffsApplied)}% of applied buffs. <br/>
          You let the buff expire ${this.expiredBuffs} time(s).`}>
          <ItemDamageDone amount={this.bonusDmg} />
        </dfn>
      ),
    };
  }
}

export default Tier21_4p;
