import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import WastedShardsIcon from 'Parser/Warlock/Shared/Images/warlock_soulshard_bw.jpg';
import SoulShardBreakdown from './SoulShardBreakdown';
import SoulShardTracker from './SoulShardTracker';

const soulShardIcon = 'inv_misc_gem_amethyst_02';

class SoulShardDetails extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  get suggestionThresholds() {
    const shardsWasted = this.soulShardTracker.shardsWasted;
    const shardsWastedPerMinute = (shardsWasted / this.owner.fightDuration) * 1000 * 60;
    return {
      actual: shardsWastedPerMinute,
      isGreaterThan: {
        minor: 5 / 10, // 5 shards in 10 minute fight
        average: 5 / 3, // 5 shards in 3 minute fight
        major: 10 / 3, // 10 shards in 3 minute fight
      },
      style: 'number', // TODO: not sure about this yet
    };
  }

  suggestions(when) {
    const shardsWasted = this.soulShardTracker.shardsWasted;
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('You are wasting Soul Shards. Try to use them and not let them cap and go to waste unless you\'re preparing for bursting adds etc.')
          .icon(soulShardIcon)
          .actual(`${shardsWasted} Soul Shards wasted (${actual.toFixed(2)} per minute)`)
          .recommended(`< ${recommended.toFixed(2)} Soul Shards per minute wasted are recommended`);
      });
  }

  statistic() {
    const shardsWasted = this.soulShardTracker.shardsWasted;
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
      title: 'Soul Shard usage',
      url: 'soul-shards',
      render: () => (
        <Tab>
          <SoulShardBreakdown
            shardsGeneratedAndWasted={this.soulShardTracker.generatedAndWasted}
            shardsSpent={this.soulShardTracker.spent}
          />
        </Tab>
      ),
    };
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default SoulShardDetails;
