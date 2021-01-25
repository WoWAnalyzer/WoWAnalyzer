import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';

import { formatPercentage, formatDuration } from 'common/format';

import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import UptimeIcon from 'interface/icons/Uptime';

import { t } from '@lingui/macro';

/*
example report: https://www.warcraftlogs.com/reports/1HRhNZa2cCkgK9AV/#fight=48&source=10
* */

class Momentum extends Analyzer {

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

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MOMENTUM_TALENT.id);
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<> Maintain the <SpellLink id={SPELLS.MOMENTUM_TALENT.id} /> buff to maximize damage.</>)
        .icon(SPELLS.MOMENTUM_TALENT.icon)
        .actual(t({
      id: "demonhunter.havoc.suggestions.momentum.uptime",
      message: `${formatPercentage(actual)}% buff uptime`
    }))
        .recommended(`${formatPercentage(recommended)}% is recommended.`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
        tooltip={`The Momentum buff total uptime was ${formatDuration(this.buffDuration / 1000)}.`}
      >
        <BoringSpellValueText spell={SPELLS.MOMENTUM_TALENT}>
          <>
            <UptimeIcon /> {formatPercentage(this.buffUptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Momentum;
