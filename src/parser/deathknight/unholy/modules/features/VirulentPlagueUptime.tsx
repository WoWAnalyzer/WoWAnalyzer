import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class VirulentPlagueUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  get Uptime() {
    return this.enemies.getBuffUptime(SPELLS.VIRULENT_PLAGUE.id) / this.owner.fightDuration;
  }

  get UptimeSuggestionThresholds() {
    return {
      actual: this.Uptime,
      isLessThan: {
        minor: 0.92,
        average: 0.84,
        major: .74,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.UptimeSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => suggest(<span>Your <SpellLink id={SPELLS.VIRULENT_PLAGUE.id} /> uptime can be improved. Try to pay attention to when Virulent Plague is about to fall off the priority target, using <SpellLink id={SPELLS.OUTBREAK.id} /> to refresh Virulent Plague. Using a debuff tracker can help.</span>)
            .icon(SPELLS.VIRULENT_PLAGUE.icon)
            .actual(i18n._(t('deathknight.unholy.suggestions.virulentPlague.uptime')`${formatPercentage(actual)}% Virulent Plague uptime`))
            .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.VIRULENT_PLAGUE.id} />}
        value={`${formatPercentage(this.Uptime)} %`}
        label="Virulent Plague Uptime"
        statisticOrder={STATISTIC_ORDER.CORE(3)}
      />
    );
  }
}

export default VirulentPlagueUptime;
