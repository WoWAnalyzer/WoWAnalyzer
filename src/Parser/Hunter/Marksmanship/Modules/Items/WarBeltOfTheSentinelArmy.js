import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatNumber } from 'common/format';
import { formatPercentage } from "../../../../../common/format";

class WarBeltOfTheSentinelArmy extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  _currentStacks = 0;
  usedBeltStacks = 0;
  unCappedBeltStacks = 0;
  cappedBeltStacks = 0;
  totalBeltStacks = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWaist(ITEMS.WAR_BELT_OF_THE_SENTINEL_ARMY.id);
  }

  on_byPlayer_applybuff(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.SENTINELS_SIGHT.id) {
      return;
    }
    if (this._currentStacks === 0) {
      this._currentStacks += 1;
      this.unCappedBeltStacks += 1;
      this.totalBeltStacks += 1;
    }

  }

  on_byPlayer_applybuffstack(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.SENTINELS_SIGHT.id) {
      return;
    }
    this._currentStacks += 1;
    this.unCappedBeltStacks += 1;
    this.totalBeltStacks += 1;

  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (!this.combatants.selected.hasBuff(SPELLS.SENTINELS_SIGHT.id, event.timestamp)) {
      return;
    }
    if (spellId === SPELLS.AIMED_SHOT.id) {
      this.usedBeltStacks += this._currentStacks;
      this._currentStacks = 0;
    }

    if (spellId === SPELLS.MULTISHOT.id && this._currentStacks > 19) {
      this.cappedBeltStacks += 1;
      this.totalBeltStacks += 1;
    }

  }

  item() {
    return {
      item: ITEMS.WAR_BELT_OF_THE_SENTINEL_ARMY,
      result: (<dfn data-tip={`You wasted ${formatNumber(this.cappedBeltStacks)} belt stacks. Try and avoid this if you can, as each stack buffs Aimed Shot damage by 10%, leading you to effectively having lost out on damage equivalent to ${this.cappedBeltStacks / 10} Aimed Shots. <br /> Try and utilise all of your gained belt stacks, so as to not let the buff expire or let the fight end before you can gain the damage benefit, you utilised ${formatPercentage(this.usedBeltStacks / this.totalBeltStacks)}% possible stacks`}>
          You gained {this.unCappedBeltStacks} stacks and wasted {this.cappedBeltStacks} through capping. <br />
          You used {formatPercentage(this.usedBeltStacks / this.totalBeltStacks)}% of gained stacks.
        </dfn>
      ),
    };
  }
}

export default WarBeltOfTheSentinelArmy;
