import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = false;
const CONCORDANCE_SPELLS = {
  INTELLECT: SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_INTELLECT,
  AGILITY: SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_AGILITY,
  STRENGTH: SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_STRENGTH,
  VERSATILITY: SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_VERSATILITY,
};
class Concordance extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  appliedBuff = null;
  statisticOrder = STATISTIC_ORDER.TRAITS(0);

  statistic() {
    const rank = this.combatants.selected.traitsBySpellId[SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_TRAIT.id];
    Object.values(CONCORDANCE_SPELLS).forEach(item => {
      const uptime = this.combatants.selected.getBuffUptime(item.id) / this.owner.fightDuration;
      if (uptime > 0) {
        this.appliedBuff = {
          id: item.id,
          uptime: uptime,
        };
      }
    });
  
    if (!this.appliedBuff) {
      return;
    }

    if (debug) {
      console.log("Concordance: Rank", rank, "; Uptime: ", this.appliedBuff.uptime);
    }
    return (
      <StatisticBox
      icon={<SpellIcon id={this.appliedBuff.id} />}
      value={`${formatPercentage(this.appliedBuff.uptime)}%`}
      label='Concordance of the Legionfall uptime'
      tooltip={`Rank ${rank}`}
    />);
  }
}

export default Concordance;
