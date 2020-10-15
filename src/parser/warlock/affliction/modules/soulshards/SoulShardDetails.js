import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';

import SPELLS from 'common/SPELLS';

import Panel from 'interface/others/Panel';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import '../../../shared/modules/soulshards/SoulShardDetails.css';
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
      .addSuggestion((suggest, actual, recommended) => suggest('You are wasting Soul Shards. Try to use them and not let them cap and go to waste unless you\'re preparing for bursting adds etc.')
          .icon(SPELLS.SOUL_SHARDS.icon)
          .actual(i18n._(t('warlock.affliction.suggestions.soulShards.wastedPerMinute')`${shardsWasted} Soul Shards wasted (${actual.toFixed(2)} per minute)`))
          .recommended(`< ${recommended.toFixed(2)} Soul Shards per minute wasted are recommended`));
  }

  statistic() {
    const shardsWasted = this.soulShardTracker.wasted;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        tooltip={(<>In order for Focus Magic to compete with the other talents on that row, you need to ensure you are getting as much uptime out of the buff as possible. Therefore, if you forget to put the buff on another player or if they player you gave it to is not getting crits very often, then you might need to consider giving the buff to someone else. Ideally, you should aim to trade buffs with another mage who has also taken Focus Magic so you both get the full benefit.</>)}
      >
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
          <ResourceBreakdown
            tracker={this.soulShardTracker}
            showSpenders
          />
        </Panel>
      ),
    };
  }
}

export default SoulShardDetails;
