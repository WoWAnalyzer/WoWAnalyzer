import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { TooltipElement } from 'common/Tooltip';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class SavageRoarUptime extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SAVAGE_ROAR_TALENT.id);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SAVAGE_ROAR_TALENT.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          Your <SpellLink id={SPELLS.SAVAGE_ROAR_TALENT.id} /> uptime can be improved. You should refresh the buff once it has reached its <TooltipElement content="The last 30% of the DoT's duration. When you refresh during this time you don't lose any duration in the process.">pandemic window</TooltipElement>, don't wait for it to wear off. You may also consider switching to <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_TALENT_FERAL.id} /> which is simpler to use and provides more damage in many situations.
        </>,
      )
        .icon(SPELLS.SAVAGE_ROAR_TALENT.icon)
        .actual(i18n._(t('druid.feral.suggestions.savageRoar.uptime')`${formatPercentage(actual)}% uptime`))
        .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SAVAGE_ROAR_TALENT.id} />}
        value={`${formatPercentage(this.uptime)}%`}
        label="Savage Roar uptime"
        position={STATISTIC_ORDER.OPTIONAL(0)}
      />
    );
  }
}

export default SavageRoarUptime;
