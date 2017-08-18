import React from 'react';

import Module from 'Parser/Core/Module';
import StatisticBox from 'Main/StatisticBox';

import SoulShardBreakdown from './SoulShardBreakdown';
import WastedShardsIcon from '../../Images/affliction_warlock_soulshard_bw.jpg';
import SoulShardTracker from './SoulShardTracker';
const soulShardIcon = 'inv_misc_gem_amethyst_02';

class SoulShardDetails extends Module {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };
  suggestions(when) {
    const shardsWasted = this.soulShardTracker.shardsWasted;
    when(shardsWasted).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('You are wasting Soul Shards. Try to use them and not let them cap and go to waste unless you\'re preparing for bursting adds etc.')
          .icon(soulShardIcon)
          .actual(`${actual} Soul Shards wasted`)
          .recommended(`No Soul Shards wasted are recommended`)
          .regular(recommended + 1).major(recommended + 2);
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
        tooltip={`You are wasting Soul Shards. Try to use them and not let them cap and go to waste unless you're preparing for bursting adds etc.`}
      />
    );
  }

  tab() {
    return {
      title: 'Soul Shard usage',
      url: 'soul-shards',
      render: () => (
        <div>
          <div className="panel-heading">
            <h2>Soul Shard usage breakdown</h2>
          </div>
          <div style={{ padding: '10px 0 15px' }}>
            <SoulShardBreakdown
              shardsGained = {this.soulShardTracker.gained}
              shardsSpent = {this.soulShardTracker.spent}
              shardsWasted = {this.soulShardTracker.wasted}
            />
          </div>
        </div>
      ),
    };
  }
}

export default SoulShardDetails;
