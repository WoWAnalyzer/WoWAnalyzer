import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';
import { formatPercentage } from 'common/format';

/**
 * First Mate's Spyglass -
 * Use: Increase your Critical Strike by 768 for 15 sec. (2 Min Cooldown)
 */
class FirstMatesSpyglass extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  
  casts = 0;
  timesDamageCrit = 0;
  timesHealCrit = 0;
    
  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(
      ITEMS.FIRST_MATES_SPYGLASS.id
    );
  }
  
  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.SPYGLASS_SIGHT.id) {
    return;
    }
    this.casts += 1;
  }
  
  on_byPlayer_damage(event) {
    if (!this.combatants.selected.hasBuff(SPELLS.SPYGLASS_SIGHT.id)) {
      return;
    }
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
    }
    this.timesDamageCrit += 1;
  }
  
  on_byPlayer_heal(event) {
    if (!this.combatants.selected.hasBuff(SPELLS.SPYGLASS_SIGHT.id)) {
      return;
    }      
    if (event.hitType !== HIT_TYPES.CRIT) {
      return;
      }
      this.timesHealCrit += 1;
  }
  
  get totalBuffUptime() {
      return this.combatants.selected.getBuffUptime(SPELLS.SPYGLASS_SIGHT.id) / this.owner.fightDuration;
  }
  
  item() {
    return {
      item: ITEMS.FIRST_MATES_SPYGLASS,
      result: (
        <dfn data-tip={`You critically damaged ${this.timesDamageCrit} times with this buff up<br/>
                        You critically healed ${this.timesHealCrit} times with this buff up`}>
          Used {this.casts} times / {formatPercentage(this.totalBuffUptime)}% uptime
        </dfn>
      ),
    };
  }
}

export default FirstMatesSpyglass;