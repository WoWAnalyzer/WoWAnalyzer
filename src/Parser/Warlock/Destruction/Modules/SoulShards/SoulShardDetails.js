import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import SoulShardBreakdown from './SoulShardBreakdown';
import SoulShardTracker from './SoulShardTracker';

import WastedShardsIcon from '../../Images/warlock_soulshard_bw.jpg';

const soulShardIcon = 'inv_misc_gem_amethyst_02';

class SoulShardDetails extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  get suggestionThresholds() {
    const fragmentsWasted = this.soulShardTracker.fragmentsWasted;
    const fragmentsWastedPerMinute = (fragmentsWasted / this.owner.fightDuration) * 1000 * 60;

    // Shards wasted for Destro are much more strict because the shard generation in Destro is much more reliable and less random, so there should be almost no wasted shards (if so, it's your own fault, not RNG)
    return {
      actual: fragmentsWastedPerMinute,
      isGreaterThan: {
        minor: 1,   // 1 fragment per minute (1 shard in 10 minutes)
        average: 3, // 3 fragments per minute (3 shards in 10 minutes)
        major: 5,   // 5 fragments per minute (5 shards in 10 minutes)
      },
      style: 'number',
    };
  }

  suggestions(when) {
    const fragmentsWasted = this.soulShardTracker.fragmentsWasted;
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('You are wasting Soul Shards. Try to use them and not let them cap and go to waste unless you\'re preparing for bursting adds etc.')
          .icon(soulShardIcon)
          .actual(`${fragmentsWasted} Soul Shard Fragments wasted (${actual.toFixed(2)} per minute)`)
          .recommended(`< ${recommended} Soul Shard Fragments per minute wasted are recommended`);
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
