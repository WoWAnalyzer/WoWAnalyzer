import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import React from 'react';

// the buff events all use this spell
export const RUSHING_JADE_WIND_BUFF = SPELLS.RUSHING_JADE_WIND;

class RushingJadeWind extends Analyzer {
  get uptimeThreshold() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.85,
        average: 0.75,
        major: 0.65,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(RUSHING_JADE_WIND_BUFF.id) / this.owner.fightDuration
    );
  }

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RUSHING_JADE_WIND.id);
  }

  // using a suggestion rather than a checklist item for this as RJW is

  // purely offensive
  suggestions(when) {
    when(this.uptimeThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You had low uptime on <SpellLink id={SPELLS.RUSHING_JADE_WIND.id} />. Try to maintain 100%
          uptime by refreshing the buff before it drops.
        </>,
      )
        .icon(SPELLS.RUSHING_JADE_WIND.icon)
        .actual(
          t({
            id: 'monk.brewmaster.suggestions.rushingJadeWind.uptime',
            message: `${formatPercentage(actual)}% uptime`,
          }),
        )
        .recommended(`${Math.round(formatPercentage(recommended))}% is recommended`),
    );
  }
}

export default RushingJadeWind;
