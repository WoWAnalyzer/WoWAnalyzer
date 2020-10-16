import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';

import SPELLS from 'common/SPELLS';

import Panel from 'interface/others/Panel';
import Warning from 'interface/Alert/Warning';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import 'parser/warlock/shared/modules/soulshards/SoulShardDetails.css';
import SoulShardTracker from './SoulShardTracker';

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
      .addSuggestion((suggest, actual, recommended) => suggest('You are wasting Soul Shards. Try to use them and not let them cap and go to waste unless you\'re preparing for bursting adds etc.')
          .icon(SPELLS.SOUL_SHARDS.icon)
          .actual(i18n._(t('warlock.destruction.suggestions.soulShard.wastedPerMinute')`${fragmentsWasted} Soul Shard Fragments wasted (${actual.toFixed(2)} per minute)`))
          .recommended(`< ${recommended} Soul Shard Fragments per minute wasted are recommended`));
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
          <Warning style={{ marginLeft: 0, marginRight: 0 }}>
            Due to the technical limitations and randomness of Immolate{(this.selectedCombatant.hasTalent(SPELLS.INFERNO_TALENT.id)) ? ' and Rain of Fire with Inferno talent' : ''}, we can't accurately determine the amount of generated Soul Shard Fragments, but we tried to estimate the amount of random fragments and count them in. <br />
            Summon Infernal also has a very inconsistent shard generation which might mess up the tracking as well. Take this tab with a grain of salt.
          </Warning>
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
