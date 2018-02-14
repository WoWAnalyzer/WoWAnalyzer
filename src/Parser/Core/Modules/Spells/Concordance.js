import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';

import SmallStatisticBox, { STATISTIC_ORDER } from 'Main/SmallStatisticBox';
import SpellLink from 'common/SpellLink';

const debug = false;
const CONCORDANCE_SPELLS = {
  INTELLECT: SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_INTELLECT,
  AGILITY: SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_AGILITY,
  STRENGTH: SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_STRENGTH,
  VERSATILITY: SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_VERSATILITY,
};

class Concordance extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.rank > 0;
  }
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
  subStatistic() {
    if (!this.appliedBuff) {
      return;
    }
    if (debug) {
      console.log("Concordance: Rank", this.rank, "; Uptime: ", this.appliedBuff.uptime);
    }
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={this.appliedBuff.id}>
            <SpellIcon id={this.appliedBuff.id} noLink /> Concordance
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`Rank ${this.rank}`}>
            {formatPercentage(this.appliedBuff.uptime)}% uptime
          </dfn>
        </div>
      </div>
    );
  }
}

export default Concordance;
