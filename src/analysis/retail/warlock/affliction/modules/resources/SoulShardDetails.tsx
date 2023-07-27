import { defineMessage } from '@lingui/macro';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Panel } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import SoulShardTracker from './SoulShardTracker';

class SoulShardDetails extends Analyzer {
  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  protected soulShardTracker!: SoulShardTracker;

  get wastedPerMinute() {
    return (this.soulShardTracker.wasted / this.owner.fightDuration) * 1000 * 60;
  }

  get suggestionThresholds() {
    return {
      actual: this.wastedPerMinute,
      isGreaterThan: {
        minor: 5 / 10, // 5 shards in 10 minute fight
        average: 5 / 3, // 5 shards in 3 minute fight
        major: 10 / 3, // 10 shards in 3 minute fight
      },
      style: ThresholdStyle.DECIMAL,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        "You are wasting Soul Shards. Try to use them and not let them cap and go to waste unless you're preparing for bursting adds etc.",
      )
        .icon(RESOURCE_TYPES.SOUL_SHARDS.icon)
        .actual(
          defineMessage({
            id: 'warlock.affliction.suggestions.soulShards.wastedPerMinute',
            message: `${this.soulShardTracker.wasted} Soul Shards wasted (${actual.toFixed(
              2,
            )} per minute)`,
          }),
        )
        .recommended(
          `Wasting less than ${recommended.toFixed(2)} Soul Shards per minute is recommended`,
        ),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        tooltip={`${this.soulShardTracker.wasted} out of ${
          this.soulShardTracker.wasted + this.soulShardTracker.generated
        } Soul Shards wasted.`}
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.SOUL_SHARDS}
          value={this.wastedPerMinute.toFixed(2)}
          label="Soul Shards wasted per minute"
        />
      </Statistic>
    );
  }

  tab() {
    return {
      title: 'Soul Shard usage',
      url: 'soul-shard-usage',
      render: () => (
        <Panel>
          <ResourceBreakdown tracker={this.soulShardTracker} showSpenders />
        </Panel>
      ),
    };
  }
}

export default SoulShardDetails;
