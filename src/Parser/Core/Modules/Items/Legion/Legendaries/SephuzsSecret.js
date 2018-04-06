import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const PASSIVE_HASTE = 0.02;
const ACTIVE_HASTE = 0.25;

/*
 * Sephuz's Secret -
 * Equip: Gain 10% increased movement speed and 2% Haste. Successfully applying a loss of control effect to an enemy, interrupting an enemy, or dispelling any target increases this effect to 70% increased movement speed and 25% Haste for 10 sec. This increase may occur once every 30 sec.
 */
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
        <dfn data-tip={`This is the average haste percentage gained, factoring in both the passive and active bonuses. The active's uptime was <b>${formatPercentage(uptimePercent)}%</b>`}>
          {formatPercentage(avgHaste)}% average haste
        </dfn>
      ),
    };
  }
}

export default SephuzsSecret;
