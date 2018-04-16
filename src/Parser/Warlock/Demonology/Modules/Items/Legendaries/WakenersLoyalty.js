import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';

import ItemDamageDone from 'Main/ItemDamageDone';

const DAMAGE_BONUS_PER_STACK = 0.03;

class WakenersLoyalty extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };

  _totalUsedStacks = 0;
  _currentStacks = 0;
  _currentBonusMultiplier = 0;
  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasHead(ITEMS.WAKENERS_LOYALTY.id);
  }

  // applybuff is unnecessary - we don't know how many stacks it added (it doesn't produce applybuffstack, directly gives more stacks)
  // and it's highly unlikely that you would cast only one summon during the 45 sec CD of TKC (so applybuffstack wouldn't happen)
  on_toPlayer_applybuffstack(event) {
    if (event.ability.guid !== SPELLS.WAKENERS_LOYALTY.id) {
      return;
    }
    this._currentBonusMultiplier = (event.stack || 0) * DAMAGE_BONUS_PER_STACK;
    this._currentStacks = event.stack || this._currentStacks;
  }

  on_byPlayer_damage(event) {
    // TKC damages friendly pets as well
    if (event.ability.guid !== SPELLS.THALKIELS_CONSUMPTION_DAMAGE.id || event.targetIsFriendly) {
      return;
    }
    this.bonusDmg += calculateEffectiveDamage(event, this._currentBonusMultiplier);
    this._totalUsedStacks += this._currentStacks;
    this._currentBonusMultiplier = 0;
    this._currentStacks = 0;
  }

  item() {
    const tkcCasts = this.abilityTracker.getAbility(SPELLS.THALKIELS_CONSUMPTION_CAST.id).casts || 1; // it's for averages, so 1 in denominator as a default value
    return {
      item: ITEMS.WAKENERS_LOYALTY,
      result: (
        <dfn data-tip={`Total bonus damage: ${formatNumber(this.bonusDmg)}<br />Average bonus damage per TKC cast: ${formatNumber(this.bonusDmg / tkcCasts)}<br />Average stacks of Wakener's Loyalty per TKC cast: ${(this._totalUsedStacks / tkcCasts).toFixed(2)}`}>
          <ItemDamageDone amount={this.bonusDmg} />
        </dfn>
      ),
    };
  }
}

export default WakenersLoyalty;
