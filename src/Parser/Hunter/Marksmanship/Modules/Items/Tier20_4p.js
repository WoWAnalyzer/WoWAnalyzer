import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from "common/format";

class Tier20_4p extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  totalAimed = 0;
  buffedCastAndFocusAimed = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasBuff(SPELLS.HUNTER_MM_T20_4P_BONUS.id);
  }
  get percentUptime() {
    //This calculates the uptime over the course of the encounter of the 4 p bonus
    const uptime = this.combatants.selected.getBuffUptime(SPELLS.HUNTER_MM_T20_4P_BONUS_BUFF.id) / this.owner.fightDuration;

    return uptime;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.AIMED_SHOT.id) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.HUNTER_MM_T20_4P_BONUS_BUFF.id, event.timestamp)) {
      this.buffedCastAndFocusAimed += 1;
    }
    this.totalAimed += 1;
  }
  item() {
    return {
      id: `spell-${SPELLS.HUNTER_MM_T20_4P_BONUS_BUFF.id}`,
      icon: <SpellIcon id={SPELLS.HUNTER_MM_T20_4P_BONUS_BUFF.id} />,
      title: <SpellLink id={SPELLS.HUNTER_MM_T20_4P_BONUS_BUFF.id} />,
      result: (
        <dfn data-tip={`Your utilization of tier 20 4 piece: <ul><li> Buffed Aimed Shots: ${this.buffedCastAndFocusAimed}.</li><li> Total Aimed Shot casts:  ${this.totalAimed}.</li><li> Overall uptime: ${formatPercentage(this.percentUptime)}% </li></ul>`}>
          Buffed Aimed Shot casts: {formatPercentage(this.buffedCastAndFocusAimed / this.totalAimed)}%
        </dfn>
      ),
    };
  }
}

export default Tier20_4p;
