import React from 'react';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from "common/format";

class Tier20_2p extends Module {
  static dependencies = {
    combatants: Combatants,
  };
  totalAimed = 0;
  buffedAimed = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HUNTER_MM_T20_2P_BONUS.id);
  }
  on_byPlayer_damage(event) {
    if(event.ability.guid !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    if(this.combatants.selected.hasBuff(SPELLS.HUNTER_MM_T20_2P_BONUS_BUFF.id, event.timestamp)) {
      this.buffedAimed += 1;
    }
      this.totalAimed +=1;
  }
  item() {
    return {
      id: `spell-${SPELLS.HUNTER_MM_T20_2P_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.HUNTER_MM_T20_2P_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.HUNTER_MM_T20_2P_BONUS_BUFF.id} />,
      result: (
        <dfn data-tip={`Your utilization of tier 20 2 piece: <br/> Buffed aimed shots: ${this.buffedAimed}.<br/> Total aimed shots:  ${this.totalAimed}.<br/> `}>
          Buffed Aimed Shots:  {formatPercentage(this.buffedAimed / this.totalAimed)}%
        </dfn>
      ),
    };
  }
}

export default Tier20_2p;
