import React from 'react';

import Module from 'Parser/Core/Module';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import SoulShardBreakdown from './SoulShardBreakdown';
import SoulShardTracker from './SoulShardTracker';

import WastedShardsIcon from '../../Images/affliction_warlock_soulshard_bw.jpg';

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
          .recommended('No Soul Shards wasted are recommended')
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
              alt='Wasted Soul Shards'
            />
        )}
        value={`${shardsWasted}`}
        label='Wasted Soul Shards'
      />
    );
  }

  tab() {
    return {
      title: 'Soul Shard usage',
      url: 'soul-shards',
      render: () => (
        <Tab
          title='Soul Shard usage breakdown'
          children={(<SoulShardBreakdown
            shardsGained = {this.soulShardTracker.gained}
            shardsSpent = {this.soulShardTracker.spent}
            shardsWasted = {this.soulShardTracker.wasted}
          />)}
        />
      ),
    };
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default SoulShardDetails;
