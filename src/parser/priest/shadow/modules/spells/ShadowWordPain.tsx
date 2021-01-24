import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import { formatPercentage } from 'common/format';
import { t } from '@lingui/macro';
import UptimeBar from 'parser/ui/UptimeBar';

/*
  Shadow word pain can be created by:

  Hard casting
  Misery
  Dark Void

  Shadow Word pain can be refreshed by:

  Hard casting
  Misery
  Dark Void
  Void Bolt
 */
class ShadowWordPain extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  lastCastTimestamp = 0;
  castedShadowWordPains = 0;
  appliedShadowWordPains = 0;
  refreshedShadowWordPains = 0;
  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.SHADOW_WORD_PAIN.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>Your <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> uptime can be improved. Try to pay more attention to your <SpellLink id={SPELLS.SHADOW_WORD_PAIN.id} /> on the boss.</span>)
        .icon(SPELLS.SHADOW_WORD_PAIN.icon)
        .actual(t({
      id: "priest.shadow.suggestions.shadowWordPain.uptime",
      message: `${formatPercentage(actual)}% Shadow Word: Pain uptime`
    }))
        .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }


  subStatistic() {
    const history = this.enemies.getDebuffHistory(SPELLS.SHADOW_WORD_PAIN.id);
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon id={SPELLS.SHADOW_WORD_PAIN.id} />
        </div>
        <div className="flex-sub value" style={{ width: 140 }}>
          {formatPercentage(this.uptime, 0)}% <small>uptime</small>
        </div>
        <div className="flex-main chart" style={{ padding: 15 }}>
          <UptimeBar
            uptimeHistory={history}
            start={this.owner.fight.start_time}
            end={this.owner.fight.end_time}
          />
        </div>
      </div>
    );
  }
}

export default ShadowWordPain;
