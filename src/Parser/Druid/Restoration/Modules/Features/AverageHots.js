import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Mastery from '../Core/Mastery';

class AverageHots extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    mastery: Mastery,
  };


  statistic() {
    const avgTotalHots = (this.mastery.getAverageTotalMasteryStacks()).toFixed(2);
    const avgDruidHots = (this.mastery.getAverageDruidSpellMasteryStacks()).toFixed(2);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.MASTERY_HARMONY.id} />}
        value={`${avgTotalHots}`}
        label="Average Mastery Stacks"
        tooltip={`This is the average number of mastery stacks your heals benefitted from, weighted by healing done. It can help show how much mileage you're getting out of your mastery.<br/><br/>Not all of this number is within your control. Having to do a lot of tank healing or speccing for Cultivation and/or Spring Blossoms tends to produce higher average mastery stacks, while playing in larger raid groups tends to produce lower average mastery stacks.<br/><br/>This number counts all your healing, even heals that don't benefit from your mastery (like most trinkets). Your average mastery stacks counting only heals that benefit from mastery is <b>${avgDruidHots}</b>.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(11);

}

export default AverageHots;
