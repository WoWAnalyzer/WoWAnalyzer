import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import SmallStatisticBox, { STATISTIC_ORDER } from 'Main/SmallStatisticBox';

const debug = false;
const CONCORDANCE_SPELLS = {
  INTELLECT: SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_INTELLECT,
  AGILITY: SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_AGILITY,
  STRENGTH: SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_STRENGTH,
  VERSATILITY: SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_VERSATILITY,
};

class ConcordanceUptimeTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  get rank() {
    return this.combatants.selected.traitsBySpellId[SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_TRAIT.id];
  }

  get appliedBuff() {
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
      <SmallStatisticBox
        icon={<SpellIcon id={this.appliedBuff.id} />}
        value={`${formatPercentage(this.appliedBuff.uptime)} %`}
        label="Concordance uptime"
        tooltip={`Rank ${this.rank}`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.UNIMPORTANT();
}

export default ConcordanceUptimeTracker;
