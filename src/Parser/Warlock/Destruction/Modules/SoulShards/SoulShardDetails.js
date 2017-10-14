import React from 'react';

import Module from 'Parser/Core/Module';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import SoulShardBreakdown from './SoulShardBreakdown';
import SoulShardTracker from './SoulShardTracker';

import WastedShardsIcon from '../../Images/warlock_soulshard_bw.jpg';

const soulShardIcon = 'inv_misc_gem_amethyst_02';

const MINOR = 1; // 1 shard per 10 minutes
const AVG = 3; // 3 shards per 10 minutes
const MAJOR = 5; // 5 shards per 10 minutes

class SoulShardDetails extends Module {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  suggestions(when) {
    const fragmentsWasted = this.soulShardTracker.fragmentsWasted;
    const fragmentsWastedPerMinute = (fragmentsWasted / this.owner.fightDuration) * 1000 * 60;
    // Shards wasted for Destro are much more strict because the shard generation in Destro is much more reliant and less random, so there should be almost no wasted shards (if so, it's your own fault, not RNG)
    when(fragmentsWastedPerMinute).isGreaterThan(MINOR)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('You are wasting Soul Shards. Try to use them and not let them cap and go to waste unless you\'re preparing for bursting adds etc.')
          .icon(soulShardIcon)
          .actual(`${fragmentsWasted} Soul Shard Fragments wasted (${fragmentsWastedPerMinute.toFixed(2)} per minute)`)
          .recommended(`< ${recommended} Soul Shard Fragments per minute wasted are recommended`)
          .regular(AVG).major(MAJOR);
      });
  }

  statistic() {
    const fragmentsWasted = this.soulShardTracker.fragmentsWasted;
    return (
      <StatisticBox
        icon={(
          <img
            src={WastedShardsIcon}
            alt="Wasted Soul Shards"
          />
        )}
        value={`${fragmentsWasted}`}
        label="Wasted Soul Shard Fragments"
      />
    );
  }

  tab() {
    return {
      title: 'Soul Shard usage',
      url: 'soul-shards',
      render: () => (
        <Tab title="Soul Shard usage breakdown">
          <SoulShardBreakdown
            fragmentsGeneratedAndWasted={this.soulShardTracker.generatedAndWasted}
            fragmentsSpent={this.soulShardTracker.spent}
          />
        </Tab>
      ),
    };
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default SoulShardDetails;
