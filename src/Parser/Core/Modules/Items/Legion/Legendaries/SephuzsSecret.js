import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatTracker from 'Parser/Core/Modules/StatTracker';

const PASSIVE_HASTE = 0.02;
const ACTIVE_HASTE = 0.25;

/*
 * Sephuz's Secret -
 * Equip: Gain 10% increased movement speed and 2% Haste. Successfully applying a loss of control effect to an enemy, interrupting an enemy, or dispelling any target increases this effect to 70% increased movement speed and 25% Haste for 10 sec. This increase may occur once every 30 sec.
 */
class SephuzsSecret extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SEPHUZS_SECRET.id);
  }

  item() {
    const uptimePercent = this.combatants.selected.getBuffUptime(SPELLS.SEPHUZS_SECRET_BUFF.id) / this.owner.fightDuration;
    const startHaste = this.statTracker.startingHasteRating / 37500;
    const avgHaste = (uptimePercent * ((1 + startHaste) * ACTIVE_HASTE)) + ((1 - uptimePercent) * ((1 + startHaste) * PASSIVE_HASTE));
    return {
      item: ITEMS.SEPHUZS_SECRET,
      result: (
        <span>
          <dfn
            data-tip={`This is the average haste percentage gained, factoring in both the passive and active bonuses. The active's uptime was <b>${formatPercentage(uptimePercent)}%</b>. <br/> The average haste gained with 0% uptime can still be higher than 2%, as Sephuz also increases your existing haste by 2% before applying the flat 2%.`}
          >
            {formatPercentage(avgHaste)} % average haste
          </dfn>
        </span>
      ),
    };
  }
}

export default SephuzsSecret;
