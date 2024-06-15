import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';

class ArcaneIntellect extends Analyzer {
  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.ARCANE_INTELLECT.id) / this.owner.fightDuration
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 1,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          <SpellLink spell={SPELLS.ARCANE_INTELLECT} /> was up for {formatPercentage(this.uptime)}%
          of the fight. Ensure you are casting this before the pull and recasting it every time you
          are ressurected.
        </>,
      )
        .icon(SPELLS.ARCANE_INTELLECT.icon)
        .actual(`${formatPercentage(this.uptime)}% Uptime`)
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default ArcaneIntellect;
