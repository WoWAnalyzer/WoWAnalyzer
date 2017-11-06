import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const PASSIVE_HASTE = 0.02;
const ACTIVE_HASTE = 0.25;

class SephuzsSecret extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SEPHUZS_SECRET.id);
  }

  item() {
    const uptimePercent = this.combatants.selected.getBuffUptime(SPELLS.SEPHUZS_SECRET_BUFF.id) / this.owner.fightDuration;
    const avgHaste = (uptimePercent * ACTIVE_HASTE) + ((1 - uptimePercent) * PASSIVE_HASTE);

    return {
      item: ITEMS.SEPHUZS_SECRET,
      result: (
        <span>
          <dfn
            data-tip={`This is the average haste percentage gained, factoring in both the passive and active bonuses. The active's uptime was <b>${formatPercentage(uptimePercent)}%</b>`}
          >
            {formatPercentage(avgHaste)} % average haste
          </dfn>
        </span>
      ),
    };
  }
}

export default SephuzsSecret;
