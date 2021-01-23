import React from 'react';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import { SpellIcon } from 'interface';
import BoringValue from 'parser/ui/BoringValueText';

import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';

import Mastery from '../core/Mastery';

class AverageHots extends Analyzer {
  static dependencies = {
    mastery: Mastery,
  };

  protected mastery!: Mastery;

  statistic() {
    const avgTotalHots = (this.mastery.getAverageTotalMasteryStacks()).toFixed(2);
    const avgDruidHots = (this.mastery.getAverageDruidSpellMasteryStacks()).toFixed(2);

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(11)}
        size="flexible"
        tooltip={(
          <>
            This is the average number of mastery stacks your heals benefitted from, weighted by healing done. It can help show how much mileage you're getting out of your mastery.<br /><br />

            Not all of this number is within your control. Having to do a lot of tank healing or speccing for Cultivation and/or Spring Blossoms tends to produce higher average mastery stacks, while playing in larger raid groups tends to produce lower average mastery stacks.<br /><br />

            This number counts all your healing, even heals that don't benefit from your mastery (like most trinkets). Your average mastery stacks counting only heals that benefit from mastery is <strong>{avgDruidHots}</strong>.
          </>
        )}
      >
        <BoringValue label={<><SpellIcon id={SPELLS.MASTERY_HARMONY.id} /> Average Mastery stacks</>}>
          <>
            {avgTotalHots}
          </>
        </BoringValue>
      </Statistic>
    );
  }

}

export default AverageHots;
