import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'parser/core/Analyzer';
import Statistic from 'interface/statistics/Statistic';
import DonutChart from 'interface/statistics/components/DonutChart';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

import RollTheBonesCastTracker from '../features/RollTheBonesCastTracker';

class RollTheBonesCounter extends Analyzer {
  static dependencies = {
    rollTheBonesCastTracker: RollTheBonesCastTracker,
  };

  rolltheBonesBuffDistributionChart() {
    const castTracker = this.rollTheBonesCastTracker;

    const distributionObj = castTracker.rolltheBonesCastEvents.reduce((buffCount, cast) => {
      buffCount[cast.appliedBuffs.length] = (buffCount[cast.appliedBuffs.length] || 0) + 1;
      return buffCount;
    }, { });

    const items = [
      {
        color: '#00b159',
        label: <>1 Buff</>,
        value: distributionObj[1] || 0,
      },
      {
        color: '#db00db',
        label: <>2 Buffs</>,
        value: distributionObj[2] || 0,
      },
      {
        color: '#f37735',
        label: <>5 Buffs</>,
        value: distributionObj[5] || 0,
      },
    ];

    return (
      <DonutChart
        items={items}
      />
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        tooltip="Simulated averages are approximately 80% chance for 1 buff, 19% chance for 2 buffs, 1% chance for 5 buffs"
      >
        <div className="pad">
          <label><SpellLink id={SPELLS.ROLL_THE_BONES.id} /> distribution</label>
          {this.rolltheBonesBuffDistributionChart()}
        </div>
      </Statistic>
    );
  }
}

export default RollTheBonesCounter;
