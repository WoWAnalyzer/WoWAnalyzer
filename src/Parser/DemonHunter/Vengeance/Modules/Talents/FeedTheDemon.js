import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatNumber } from 'common/format';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import SoulFragmentsTracker from '../Features/SoulFragmentsTracker';

//WCL https://www.warcraftlogs.com/reports/ZVJr2MPNx3RCvX6B#fight=6&type=damage-done
class FeedTheDemon extends Analyzer {
  static dependencies = {
    soulFragmentsTracker: SoulFragmentsTracker,
    abilityTracker: AbilityTracker,
  };

  casts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FEED_THE_DEMON_TALENT.id);
  }

  get reduction(){
    return this.soulFragmentsTracker.FTDReduction / 1000;
  }

  get wastedReduction(){
    return this.soulFragmentsTracker.FTDReductionWasted / 1000;
  }

  get averageReduction(){
    const casts = this.abilityTracker.getAbility(SPELLS.DEMON_SPIKES.id).casts;
    return (this.reduction / casts) || 0;
  }

  get wastedPercent(){
    return this.wastedReduction / (this.wastedReduction + this.reduction);
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FEED_THE_DEMON_TALENT.id} />}
        value={`${formatNumber(this.averageReduction)} sec`}
        label="Feed the Demon average reduction"
        tooltip={`${formatNumber(this.reduction)} sec total effective reduction.</br>
                  ${formatNumber(this.wastedReduction)} sec (${formatPercentage(this.wastedPercent)}%) wasted reduction.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default FeedTheDemon;
