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
import EventHistory from 'parser/shared/modules/EventHistory';

// Example log: /report/JAPL1zpDfN7W8wck/33-Heroic+The+Council+of+Blood+-+Kill+(5:46)/Mayrim/standard/statistics
class DarkThoughts extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;

  procsGained = 0;
  procsUsed = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DARK_THOUGHT_BUFF), this.onBuffApplied);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DARK_THOUGHT_BUFF), this.onBuffRemoved);
  }

  onBuffApplied() {
    this.procsGained += 1; // Add a proc to the counter
  }

  onBuffRemoved() {
    if (!this.eventHistory.last(1, 100, Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MIND_BLAST))) { // If MB is not instant, it's not a proc
      return;
    }

    this.procsUsed += 1;
  }

  get procsWasted() {
    return this.procsGained - this.procsUsed;
  }

  get suggestionThresholds() {
    return {
      actual: this.procsWasted / this.procsGained,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
    .addSuggestion((suggest, actual, recommended) => suggest(<>You wasted {this.procsWasted} out of {this.procsGained} <SpellLink id={SPELLS.DARK_THOUGHTS.id} /> procs. Remember that the proc allows you to cast <SpellLink id={SPELLS.MIND_BLAST.id} /> instantly during <SpellLink id={SPELLS.MIND_FLAY.id} />, <SpellLink id={SPELLS.MIND_SEAR.id} />, and <SpellLink id={SPELLS.VOID_TORRENT_TALENT.id} />. Using during one of these casts allows you to double dip on damage during the global.</>)
          .icon(SPELLS.DARK_THOUGHTS.icon)
          .actual(
            t({
              id:'priest.shadow.suggestions.darkThoughts.efficiency',
              message: `You wasted ${this.procsWasted} out of ${this.procsGained} Dark Thought procs.`
            })
          )
          .recommended(`${recommended} is recommended.`));
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.GENERAL}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.DARK_THOUGHTS}>
          <>
            {this.procsUsed}/{this.procsGained} <small>Procs Used</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DarkThoughts;
