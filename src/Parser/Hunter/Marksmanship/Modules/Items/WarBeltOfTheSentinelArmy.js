import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import { formatNumber } from 'common/format';

const BUFF_DURATION = 20000;

//TEST THIS SHIT DOG
const REMOVEBUFF_TOLERANCE = 20;

//Allow for multi-shot travel-time, but not allow for another event to happen before registering amount of stacks
const BUFFER_MS = 400;
const debug = true;

class WarBeltOfTheSentinelArmy extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  _currentStacks = 0;
  _expectedBuffEnd = 0;
  wastedBeltStacks = 0;
  totalBeltStacks = 0;
  usedBeltStacks = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWaist(ITEMS.WAR_BELT_OF_THE_SENTINEL_ARMY.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.SENTINELS_SIGHT.id, event.timestamp)) {
      return;
    }

    this._lastAimed = event;
  }

  on_toPlayer_removebuff(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.SENTINELS_SIGHT.id) {
      return;
    }
    if (!this._lastAimed) {
      return;
    }

    const damage = this._lastAimed;
    const buff = this.combatants.selected.getBuff(SPELLS.SENTINELS_SIGHT.id,damage.timestamp);
    const stacks = buff && buff.stacks ? (buff.stacks + 2) : 1;

    debug && console.log('stacks are registered being at ', stacks);
    this.totalBeltStacks += stacks;
    this._lastAimed = null;
  }

  item() {
    return {
      item: ITEMS.WAR_BELT_OF_THE_SENTINEL_ARMY,
      result: (<dfn data-tip={`You wasted ${formatNumber(this.wastedBeltStacks)} belt stacks. Try and avoid this if you can, as each stack buffs Aimed Shot damage by 10%, leading you to effectively having lost out on damage equivalent to ${this.wastedBeltStacks / 10} Aimed Shots.`}>
          You gained {this.totalBeltStacks} stacks over the course of the fight.
        </dfn>
      ),
    };
  }
}

export default WarBeltOfTheSentinelArmy;
