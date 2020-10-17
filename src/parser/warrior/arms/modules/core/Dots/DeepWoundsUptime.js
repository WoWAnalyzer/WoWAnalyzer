import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class DeepWoundsUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.MASTERY_DEEP_WOUNDS_DEBUFF.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.8,
        average: 0.7,
        major: 0.6,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(<>Your <SpellLink id={SPELLS.MASTERY_DEEP_WOUNDS.id} /> uptime can be improved. Try to use your core abilities more often to apply <SpellLink id={SPELLS.DEEP_WOUNDS.id} /> on your target</>)
        .icon(SPELLS.MASTERY_DEEP_WOUNDS.icon)
        .actual(i18n._(t('warrior.arms.suggestions.deepWounds.uptime')`${formatPercentage(actual)}% Deep Wounds uptime`))
        .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.MASTERY_DEEP_WOUNDS.id} /> uptime</>}
        value={`${formatPercentage(this.uptime)} %`}
      />
    );
  }
}

export default DeepWoundsUptime;
