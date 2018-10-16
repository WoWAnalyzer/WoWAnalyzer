import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import ResourceBreakdown from 'parser/shared/modules/resourcetracker/ResourceBreakdown';

import Tab from 'interface/others/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import SPELLS from 'common/SPELLS';
import Warning from 'interface/common/Alert/Warning';

import WastedShardsIcon from 'parser/warlock/shared/images/warlock_soulshard_bw.jpg';
import SoulShardTracker from './SoulShardTracker';

const SOUL_SHARD_ICON = 'inv_misc_gem_amethyst_02';

class SoulShardDetails extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  get suggestionThresholds() {
    const fragmentsWasted = this.soulShardTracker.wasted;
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
    const fragmentsWasted = this.soulShardTracker.wasted;
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('You are wasting Soul Shards. Try to use them and not let them cap and go to waste unless you\'re preparing for bursting adds etc.')
          .icon(SOUL_SHARD_ICON)
          .actual(`${fragmentsWasted} Soul Shard Fragments wasted (${actual.toFixed(2)} per minute)`)
          .recommended(`< ${recommended} Soul Shard Fragments per minute wasted are recommended`);
      });
  }

  statistic() {
    const fragmentsWasted = this.soulShardTracker.wasted;
    return (
      <StatisticBox
        icon={(
          <img
            src={WastedShardsIcon}
            alt="Wasted Soul Shards"
          />
        )}
        value={fragmentsWasted}
        label="Wasted Soul Shard Fragments"
      />
    );
  }

  tab() {
    return {
      title: 'Soul Shard usage',
      url: 'soul-shards',
      render: () => (
        <Tab>
          <Warning style={{ marginLeft: 0, marginRight: 0 }}>
            Due to the technical limitations and randomness of Immolate{(this.selectedCombatant.hasTalent(SPELLS.INFERNO_TALENT.id)) ? ' and Rain of Fire with Inferno talent' : ''}, we can't accurately determine the amount of generated Soul Shard Fragments, but we tried to estimate the amount of random fragments and count them in. <br />
            Summon Infernal also has a very inconsistent shard generation which might mess up the tracking as well. Take this tab with a grain of salt.
          </Warning>
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

export default SoulShardDetails;
