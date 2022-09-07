import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import { Panel } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import 'analysis/retail/warlock/SoulShardDetails.css';
import SoulShardTracker from './SoulShardTracker';

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
      style: 'decimal',
    };
  }

  static dependencies = {
    soulShardTracker: SoulShardTracker,
  };

  suggestions(when) {
    const shardsWasted = this.soulShardTracker.wasted;
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        "You are wasting Soul Shards. Try to use them and not let them cap and go to waste unless you're preparing for bursting adds etc.",
      )
        .icon(SPELLS.SOUL_SHARDS.icon)
        .actual(
          t({
            id: 'warlock.affliction.suggestions.soulShards.wastedPerMinute',
            message: `${shardsWasted} Soul Shards wasted (${actual.toFixed(2)} per minute)`,
          }),
        )
        .recommended(`< ${recommended.toFixed(2)} Soul Shards per minute wasted are recommended`),
    );
  }

  statistic() {
    const shardsWasted = this.soulShardTracker.wasted;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        tooltip={
          <>
            In order for Focus Magic to compete with the other talents on that row, you need to
            ensure you are getting as much uptime out of the buff as possible. Therefore, if you
            forget to put the buff on another player or if they player you gave it to is not getting
            crits very often, then you might need to consider giving the buff to someone else.
            Ideally, you should aim to trade buffs with another mage who has also taken Focus Magic
            so you both get the full benefit.
          </>
        }
      >
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
