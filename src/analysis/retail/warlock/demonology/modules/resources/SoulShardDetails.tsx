import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { Panel } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import SoulShardTracker from './SoulShardTracker';

const SOUL_SHARD_ICON = 'inv_misc_gem_amethyst_02';

class SoulShardDetails extends Analyzer {
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
      style: ThresholdStyle.DECIMAL,
    };
  }

  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  soulShardTracker!: SoulShardTracker;

  suggestions(when: When) {
    const shardsWasted = this.soulShardTracker.wasted;
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        "You are wasting Soul Shards. Try to use them and not let them cap and go to waste unless you're preparing for bursting adds etc.",
      )
        .icon(SOUL_SHARD_ICON)
        .actual(
          t({
            id: 'warlock.demonology.suggestions.soulShards.wastedPerMinutes',
            message: `${shardsWasted} Soul Shards wasted (${actual.toFixed(2)} per minute)`,
          }),
        )
        .recommended(`< ${recommended.toFixed(2)} Soul Shards per minute wasted are recommended`),
    );
  }

  statistic() {
    const shardsWasted = this.soulShardTracker.wasted;
    return (
      <Statistic position={STATISTIC_ORDER.CORE(3)} size="flexible">
        <BoringSpellValueText spellId={SPELLS.SOUL_SHARDS.id}>
          {shardsWasted} <small>Wasted Soul Shards</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  tab() {
    return {
      title: 'Soul Shard usage',
      url: 'soul-shards',
      render: () => (
        <Panel>
          <ResourceBreakdown tracker={this.soulShardTracker} showSpenders />
        </Panel>
      ),
    };
  }
}

export default SoulShardDetails;
