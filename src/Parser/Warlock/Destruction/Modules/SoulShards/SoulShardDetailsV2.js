import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import WastedShardsIcon from 'Parser/Warlock/Shared/Images/warlock_soulshard_bw.jpg';
import SoulShardBreakdown from './SoulShardBreakdown';
import SoulShardTrackerV2 from './SoulShardTrackerV2';
import ResourceBreakdown from 'Parser/Core/Modules/ResourceTracker/ResourceBreakdown';

const soulShardIcon = 'inv_misc_gem_amethyst_02';

class SoulShardDetailsV2 extends Analyzer {
  static dependencies = {
    soulShardTrackerV2: SoulShardTrackerV2,
  };

  get suggestionThresholds() {
    const fragmentsWasted = this.soulShardTrackerV2.wasted;
    const fragmentsWastedPerMinute = (fragmentsWasted / this.owner.fightDuration) * 1000 * 60;

    // Shards wasted for Destro are much more strict because the shard generation in Destro is much more reliable and less random, so there should be almost no wasted shards (if so, it's your own fault, not RNG)
    return {
      actual: fragmentsWastedPerMinute,
      isGreaterThan: {
        minor: 1, // 1 fragment per minute (1 shard in 10 minutes)
        average: 3, // 3 fragments per minute (3 shards in 10 minutes)
        major: 5, // 5 fragments per minute (5 shards in 10 minutes)
      },
      style: 'number',
    };
  }

  suggestions(when) {
    const fragmentsWasted = this.soulShardTrackerV2.wasted;
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('You are wasting Soul Shards. Try to use them and not let them cap and go to waste unless you\'re preparing for bursting adds etc.')
          .icon(soulShardIcon)
          .actual(`${fragmentsWasted} Soul Shard Fragments wasted (${actual.toFixed(2)} per minute)`)
          .recommended(`< ${recommended} Soul Shard Fragments per minute wasted are recommended`);
      });
  }

  statistic() {
    const fragmentsWasted = this.soulShardTrackerV2.wasted;
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
      title: 'SS2',
      url: 'soul-shards-2',
      render: () => (
        <Tab>
          <ResourceBreakdown
            tracker={this.soulShardTrackerV2}
            showSpenders
          />
        </Tab>
      ),
    };
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default SoulShardDetailsV2;
