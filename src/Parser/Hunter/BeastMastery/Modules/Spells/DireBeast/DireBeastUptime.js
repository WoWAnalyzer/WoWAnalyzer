import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from "common/SPELLS";
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";
import { formatPercentage } from "common/format";
import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';

/**
 * Summons a powerful wild beast to attack your target for 8 sec.
 * Generates 12 Focus over 8 sec.
 */
class DireBeastUptime extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = !this.combatants.selected.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id);
  }

  get percentUptime() {
    //This calculates the uptime over the course of the encounter of Dire Beast
    return this.combatants.selected.getBuffUptime(SPELLS.DIRE_BEAST_BUFF.id) / this.owner.fightDuration;
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DIRE_BEAST.id} />}
        value={`${formatPercentage(this.percentUptime)}%`}
        label="Dire Beast Uptime"
        tooltip={`If this tooltip shows over 100% uptime, it's because you on average had more than 1 Dire Beast buff active at all times. In actuality you had an average of ${(this.percentUptime).toFixed(2)} Dire Beasts up throughout the fight.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(6);

}

export default DireBeastUptime;
