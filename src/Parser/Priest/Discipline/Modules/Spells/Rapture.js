import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import Analyzer from 'Parser/Core/Analyzer';

class Rapture extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  casts = 0;
  goodCasts = 0;

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.RAPTURE.id) {
      return;
    }
    this.casts += 1;
    if (this.spellUsable.isOnCooldown(SPELLS.POWER_WORD_SHIELD.id)) {
      this.spellUsable.endCooldown(SPELLS.POWER_WORD_SHIELD.id);
      this.goodCasts += 1;
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.goodCasts / this.casts,
      isLessThan: {
        minor: 1,
        average: 0.8,
        major: 0.6,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>You cast <SpellLink id={SPELLS.RAPTURE.id} /> while <SpellLink id={SPELLS.POWER_WORD_SHIELD.id} /> was not on cooldown {this.casts - this.goodCasts} times. Try to always have <SpellLink id={SPELLS.POWER_WORD_SHIELD.id} /> on cooldown since <SpellLink id={SPELLS.RAPTURE.id} /> resets its cooldown.</React.Fragment>)
          .icon(SPELLS.RAPTURE.icon)
          .actual(`${ formatPercentage(actual) }% Rapture casts while Power Word: Shield was on cooldown`)
          .recommended(`${ formatPercentage(recommended) }%is recommended`);
      });
  }
}

export default Rapture;
