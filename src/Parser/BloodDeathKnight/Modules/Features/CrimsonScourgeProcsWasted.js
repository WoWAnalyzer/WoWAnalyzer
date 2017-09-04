import React from 'react';

import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';

import { formatPercentage } from 'common/format';
import { formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import AbilityTracker from "../../../Core/Modules/AbilityTracker";



class CrimsonScourgeProcsWasted  extends Module {

  CrimsonScourgeProcsCounterWastedCounter=0;

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.CRIMSON_SCOURGE.id) {
      this.CrimsonScourgeProcsCounterWastedCounter++;
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="spell_deathknight_bloodboil" alt="Crimson Scorge Procs" />}
        value={this.CrimsonScourgeProcsCounterWastedCounter}
        label='Crimson Scorge Procs Wasted'
        tooltip={"You let a new Crimson Scorge Proc happen before you used the previous one over writing it."}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default CrimsonScourgeProcsWasted;
