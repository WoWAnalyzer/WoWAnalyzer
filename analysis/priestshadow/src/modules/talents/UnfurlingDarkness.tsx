import React from 'react';

import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import EventHistory from 'parser/shared/modules/EventHistory';

// Example Log https://www.warcraftlogs.com/reports/ctvYK32ZhbDqLmX8#fight=30&type=damage-done

class UnfurlingDarkness extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;

  procsGained: number = 0;
  procsUsed: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.UNFURLING_DARKNESS_TALENT.id);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.UNFURLING_DARKNESS_BUFF), this.onBuffApplied);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.UNFURLING_DARKNESS_BUFF), this.onBuffRemoved);
  }

  onBuffApplied() {
    this.procsGained += 1; // Add a proc to the counter
  }

  onBuffRemoved() {
    if (!this.eventHistory.last(1, 100, Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VAMPIRIC_TOUCH))) { // If VT is not instant, it's not a proc
      return;
    }

    this.procsUsed += 1;
  }

  getProcsWasted() {
    return this.procsGained - this.procsUsed;
  }

  get suggestionThresholds() {
    return {
      actual: this.getProcsWasted() / this.procsGained,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0.05,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<>You wasted {formatPercentage(actual)}% of <SpellLink id={SPELLS.UNFURLING_DARKNESS_TALENT.id} /> procs. </>)
          .icon(SPELLS.UNFURLING_DARKNESS_TALENT.icon)
          .actual(
            t({
              id:'priest.shadow.suggestions.unfurlingDarkness.efficiency',
              message: `Wasted ${formatPercentage(actual)}% of Unfurling Darkness procs. If you're not getting enough uses from Unfurling Darkness, you'll likely benefit more from using a different talent.`
            })
          )
          .recommended(`<${formatPercentage(recommended)}% is recommended.`));
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.UNFURLING_DARKNESS_BUFF}>
          <>
            {this.procsUsed}/{this.procsGained} <small>Procs Used</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default UnfurlingDarkness;
