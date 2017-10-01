import React from 'react';

import Module from 'Parser/Core/Module';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import SoulShardBreakdown from './SoulShardBreakdown';
import SoulShardTracker from './SoulShardTracker';

import WastedShardsIcon from '../../Images/warlock_soulshard_bw.jpg';

const soulShardIcon = 'inv_misc_gem_amethyst_02';

const MINOR = 5 / 10; // 5 shards per 10 minutes
const AVG = 5 / 3; // 5 shards per 3 minutes
const MAJOR = 10 / 3; // 10 shards per 3 minutes

class SoulShardDetails extends Module {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  suggestions(when) {
    const shardsWasted = this.soulShardTracker.shardsWasted;
    const shardsWastedPerMinute = (shardsWasted / this.owner.fightDuration) * 1000 * 60;
    when(shardsWastedPerMinute).isGreaterThan(MINOR)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('You are wasting Soul Shards. Try to use them and not let them cap and go to waste unless you\'re preparing for bursting adds etc.')
          .icon(soulShardIcon)
          .actual(`${shardsWasted} Soul Shards wasted (${shardsWastedPerMinute.toFixed(2)} per minute)`)
          .recommended(`< ${recommended.toFixed(2)} Soul Shards per minute wasted are recommended`)
          .regular(AVG).major(MAJOR);
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
        <Tab title="Soul Shard usage breakdown">
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
