import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = false;
const CONCORDANCE_SPELLS = {
  INTELLECT: SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_INTELLECT,
  AGILITY: SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_AGILITY,
  STRENGTH: SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_STRENGTH,
  VERSATILITY: SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_VERSATILITY,
};
class ConcordanceUptimeTracker extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  statisticOrder = STATISTIC_ORDER.TRAITS(0);

  get rank () {
    return this.combatants.selected.traitsBySpellId[SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_TRAIT.id];
  }
  
  get appliedBuff () {
    let buff = null;
    Object.values(CONCORDANCE_SPELLS).forEach(item => {
      const uptime = this.combatants.selected.getBuffUptime(item.id) / this.owner.fightDuration;
      if (uptime > 0) {
        buff = {
          id: item.id,
          uptime: uptime,
        };
      }
    });

    return buff;
  }

  statistic() {
    if (!this.appliedBuff) {
      return;
    }

    if (debug) {
      console.log("Concordance: Rank", this.rank, "; Uptime: ", this.appliedBuff.uptime);
    }
    return (
      <StatisticBox
      icon={<SpellIcon id={this.appliedBuff.id} />}
      value={`${formatPercentage(this.appliedBuff.uptime)}%`}
      label='Concordance of the Legionfall uptime'
      tooltip={`Rank ${this.rank}`}
    />);
  }
}

export default ConcordanceUptimeTracker;
