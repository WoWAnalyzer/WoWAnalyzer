import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import ResourceBreakdown from 'parser/shared/modules/resourcetracker/ResourceBreakdown';

import SPELLS from 'common/SPELLS';

import Panel from 'interface/others/Panel';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValue from 'interface/statistics/components/BoringSpellValue';

import 'parser/warlock/shared/modules/soulshards/SoulShardDetails.css';
import SoulShardTracker from './SoulShardTracker';

class SoulShardDetails extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  get suggestionThresholds() {
    const shardsWasted = this.soulShardTracker.wasted;
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
          .icon(SPELLS.SOUL_SHARDS.icon)
          .actual(`${shardsWasted} Soul Shards wasted (${actual.toFixed(2)} per minute)`)
          .recommended(`< ${recommended.toFixed(2)} Soul Shards per minute wasted are recommended`);
      });
  }

  statistic() {
    const shardsWasted = this.soulShardTracker.wasted;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="small"
      >
        <BoringSpellValue
          spell={SPELLS.SOUL_SHARDS}
          value={shardsWasted}
          label="Wasted Soul Shards"
          className="grayscale"
        />
      </Statistic>
    );
  }

  tab() {
    return {
      title: 'Soul Shard usage',
      url: 'soul-shards',
      render: () => (
        <Panel>
          <ResourceBreakdown
            tracker={this.soulShardTracker}
            showSpenders
          />
        </Panel>
      ),
    };
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default SoulShardDetails;
