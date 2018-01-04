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

  get suggestionThresholds() {
    const hpWasted = this.holyPowerTracker.generatedAndWasted[SPELLS.LIADRINS_FURY_UNLEASHED_BUFF.id].wasted;
    const hpGained = this.holyPowerTracker.generatedAndWasted[SPELLS.LIADRINS_FURY_UNLEASHED_BUFF.id].generated;
    const hpWastedPercent = hpWasted / hpGained;
    return {
      actual: hpWastedPercent,
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const hpWasted = this.holyPowerTracker.generatedAndWasted[SPELLS.LIADRINS_FURY_UNLEASHED_BUFF.id].wasted;
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommneded) => {
        return suggest(`You wasted ${formatPercentage(actual)}% of the holy power from Liadrin's. Consider using an easier legendary.`)
          .icon(ITEMS.LIADRINS_FURY_UNLEASHED.icon)
          .actual(`${hpWasted} Holy Power wasted`)
          .recommneded(`Wasting less than ${formatPercentage(recommneded)}% is recommneded.`);
      });
  }
}

export default LiadrinsFuryUnleashed;
