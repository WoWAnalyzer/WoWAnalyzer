import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import ResourceBreakdown from 'Parser/Core/Modules/ResourceTracker/ResourceBreakdown';

import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import WastedShardsIcon from 'Parser/Warlock/Shared/Images/warlock_soulshard_bw.jpg';
import SoulShardTracker from './SoulShardTrackerV2';

const SOUL_SHARD_ICON = 'inv_misc_gem_amethyst_02';

class SoulShardDetailsV2 extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  get suggestionThresholds() {
    const shardsWasted = this.soulShardTracker.wasted;
    console.log('SS details v2, shards wasted', shardsWasted);
    const shardsWastedPerMinute = (shardsWasted / this.owner.fightDuration) * 1000 * 60;
    return {
      actual: shardsWastedPerMinute,
      isGreaterThan: {
        minor: 5 / 10, // 5 shards in 10 minute fight
        average: 5 / 3, // 5 shards in 3 minute fight
        major: 10 / 3, // 10 shards in 3 minute fight
      },
      style: 'decimal',
    };
  }

  suggestions(when) {
    const shardsWasted = this.soulShardTracker.wasted;
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('You are wasting Soul Shards. Try to use them and not let them cap and go to waste unless you\'re preparing for bursting adds etc.')
          .icon(SOUL_SHARD_ICON)
          .actual(`${shardsWasted} Soul Shards wasted (${actual.toFixed(2)} per minute)`)
          .recommended(`< ${recommended.toFixed(2)} Soul Shards per minute wasted are recommended`);
      });
  }

  statistic() {
    const shardsWasted = this.soulShardTracker.wasted;
    return (
      <StatisticBox
        icon={(
          <img
            src={WastedShardsIcon}
            alt="Wasted Soul Shards"
          />
        )}
        value={`${shardsWasted}`}
        label="Wasted Soul Shards"
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
            tracker={this.soulShardTracker}
            showSpenders
          />
        </Tab>
      ),
    };
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default SoulShardDetailsV2;
