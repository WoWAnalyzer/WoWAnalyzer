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
    const shardsWastedPerMinute = (shardsWasted / this.owner.fightDuration) * 1000 * 60;
    //Shards wasted for Destro are much more strict because the shard generation in Destro is much more reliant and less random, so there should be almost no wasted shards (if so, it's your own fault, not RNG)
    const MINOR = 1/10;
    const AVG = 3/10;
    const MAJOR = 5/10;
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
        <Tab title='Soul Shard usage breakdown'>
          <SoulShardBreakdown
            shardsGained = {this.soulShardTracker.gained}
            shardsSpent = {this.soulShardTracker.spent}
            shardsWasted = {this.soulShardTracker.wasted}
          />
        </Tab>
      ),
    };
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default SoulShardDetails;
