import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import UptimeIcon from 'interface/icons/Uptime';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

class WindfuryTotem extends Analyzer {
  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.WINDFURY_TOTEM_BUFF.id) /
      this.owner.fightDuration
    );
  }

  get uptimeThreshold() {
    return {
      actual: this.uptime,
      isLessThan: {
        // To be adjusted once we know how much dps Windfury Totem contributes
        minor: 0.99,
        average: 0.95,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE()}>
        <BoringSpellValueText spell={SPELLS.WINDFURY_TOTEM}>
          <>
            <UptimeIcon /> {formatPercentage(this.uptime)}%{' '}
            <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  suggestions(when: When) {
    when(this.uptimeThreshold).addSuggestion((suggest, actual, recommended) => suggest(
      <>
        Your <SpellLink id={SPELLS.WINDFURY_TOTEM_BUFF.id} /> uptime can be
        improved. Make sure it's always active. Cast{' '}
        <SpellLink id={SPELLS.WINDFURY_TOTEM.id} /> if the buff is about to
        fall off or if all other spells are on cooldown.
      </>,
    )
      .icon(SPELLS.WINDFURY_TOTEM_BUFF.icon)
      .actual(
        <>
          <SpellLink id={SPELLS.WINDFURY_TOTEM_BUFF.id} /> was active for {formatPercentage(actual)}% of the fight
        </>,
      )
      .recommended(`recommended: ${formatPercentage(recommended)}%`));
  }
}

export default WindfuryTotem;
