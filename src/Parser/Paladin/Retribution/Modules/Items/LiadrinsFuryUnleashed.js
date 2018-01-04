import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatNumber, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import HolyPowerTracker from '../HolyPower/HolyPowerTracker';

class LiadrinsFuryUnleashed extends Analyzer {
  static dependencies = {
    holyPowerTracker: HolyPowerTracker,
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.LIADRINS_FURY_UNLEASHED.id);
  }

  item() {
    const hpGained = this.holyPowerTracker.generatedAndWasted[SPELLS.LIADRINS_FURY_UNLEASHED_BUFF.id].generated;
    return {
      item: ITEMS.LIADRINS_FURY_UNLEASHED,
      result: (
        <dfn data-tip={`Total Holy Power Gained: ${formatNumber(hpGained)}`}>
          {formatNumber(hpGained / this.owner.fightDuration * 60000)} Holy Power gained per minute.
        </dfn>
      ),
    };
  }

  suggestions(when) {
    const hpWasted = this.holyPowerTracker.generatedAndWasted[SPELLS.LIADRINS_FURY_UNLEASHED_BUFF.id].wasted;
    const hpGained = this.holyPowerTracker.generatedAndWasted[SPELLS.LIADRINS_FURY_UNLEASHED_BUFF.id].generated;
    const hpWastedPercent = hpWasted / hpGained;
    const MINOR = 0.1;
    const AVG = 0.2;
    const MAJOR = 0.3;
    when(hpWastedPercent).isGreaterThan(MINOR)
      .addSuggestion((suggest, actual, recommneded) => {
        return suggest(`You wasted ${formatPercentage(hpWastedPercent)}% of the holy power from Liadrin's. Consider using an easier legendary.`)
          .icon(ITEMS.LIADRINS_FURY_UNLEASHED.icon)
          .actual(`${hpWasted} Holy Power wasted`)
          .recommneded(`Wasting less than ${formatPercentage(recommneded)}% is recommneded.`)
          .regular(AVG).major(MAJOR);
      });
  }
}

export default LiadrinsFuryUnleashed;
