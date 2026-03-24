import SPELLS from 'common/SPELLS';
import { Panel } from 'interface';
import { AlertWarning } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import SoulShardTracker from './SoulShardTracker';

class SoulShardDetails extends Analyzer {
  get suggestionThresholds(): NumberThreshold {
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
      style: ThresholdStyle.NUMBER,
    };
  }

  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  protected soulShardTracker!: SoulShardTracker;

  statistic() {
    const shardsWasted = this.soulShardTracker.wasted;
    return (
      <Statistic position={STATISTIC_ORDER.CORE(3)} size="flexible">
        <BoringSpellValueText spell={SPELLS.SOUL_SHARDS}>
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
          <AlertWarning style={{ marginLeft: 0, marginRight: 0 }}>
            Due to the technical limitations and randomness of Immolate , we can't accurately
            determine the amount of generated Soul Shard Fragments, but we tried to estimate the
            amount of random fragments and count them in. <br />
            Summon Infernal also has a very inconsistent shard generation which might mess up the
            tracking as well. Take this tab with a grain of salt.
          </AlertWarning>
          <ResourceBreakdown tracker={this.soulShardTracker} showSpenders />
        </Panel>
      ),
    };
  }
}

export default SoulShardDetails;
