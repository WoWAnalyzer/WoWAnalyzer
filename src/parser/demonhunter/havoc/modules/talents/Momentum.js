import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import { formatPercentage, formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

/*
example report: https://www.warcraftlogs.com/reports/1HRhNZa2cCkgK9AV/#fight=48&source=10
* */

class Momentum extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MOMENTUM_TALENT.id);
  }

  get buffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.MOMENTUM_BUFF.id) / this.owner.fightDuration;
  }

  get buffDuration() {
    return this.selectedCombatant.getBuffUptime(SPELLS.MOMENTUM_BUFF.id);
  }

  get suggestionThresholds() {
    return {
      actual: this.buffUptime,
      isLessThan: {
        minor: 0.55,
        average: 0.45,
        major: 0.40,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<> Maintain the <SpellLink id={SPELLS.MOMENTUM_TALENT.id} /> buff to maximize damage.</>)
          .icon(SPELLS.MOMENTUM_TALENT.icon)
          .actual(i18n._(t('demonhunter.havoc.suggestions.momentum.uptime')`${formatPercentage(actual)}% buff uptime`))
          .recommended(`${formatPercentage(recommended)}% is recommended.`));
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(3)}
        icon={<SpellIcon id={SPELLS.MOMENTUM_TALENT.id} />}
        value={`${formatPercentage(this.buffUptime)}%`}
        label="Momentum Uptime"
        tooltip={`The Momentum buff total uptime was ${formatDuration(this.buffDuration / 1000)}.`}
      />
    );
  }
}

export default Momentum;
