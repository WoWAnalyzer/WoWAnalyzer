import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class VampiricTouch extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.VAMPIRIC_TOUCH.id) / this.owner.fightDuration;
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
      .addSuggestion((suggest, actual, recommended) => suggest(<span>Your <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} /> uptime can be improved. Try to pay more attention to your <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} /> on the boss.</span>)
          .icon(SPELLS.VAMPIRIC_TOUCH.icon)
          .actual(i18n._(t('priest.shadow.suggestions.vampiricTouch.uptime')`${formatPercentage(actual)}% Vampiric Touch uptime`))
          .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(3)}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.VAMPIRIC_TOUCH}>
          <>
          {formatPercentage(this.uptime)}% <small>Uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VampiricTouch;
