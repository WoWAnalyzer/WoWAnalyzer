import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';

import Events, { CastEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';

class EchoingShock extends Analyzer {

  badCasts = 0;
  casts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ECHOING_SHOCK_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  get efficiency() {
    return 1 - (this.badCasts / this.casts) || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.efficiency,
      isLessThan: {
        minor: 0.95,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  onCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.ECHOING_SHOCK_TALENT.id)) {
      return;
    }

    this.casts += 1;

    if (event.ability.guid !== SPELLS.LAVA_BURST.id) {
      this.badCasts += 1;
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            Maximize your damage with Echoing Shock by always duplicating Lava Burst.
          </span>,
        )
          .icon(SPELLS.ECHOING_SHOCK_TALENT.icon)
          .actual(`${formatPercentage(actual)}% of Echoing Shocks used on Lava Burst`)
          .recommended(`${formatPercentage(recommended)}% is recommended`));
  }
}

export default EchoingShock;
