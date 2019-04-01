import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

class AprilFools extends Analyzer {

	constructor(...args) {
    super(...args);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  cast = 0;

  onCast(event) {
    if (event.ability.guid !== SPELLS.ARCANE_BLAST.id) {
      this.cast += 1;
    }
  }

	get suggestionThresholds() {
    return {
      actual: this.cast,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: 'number',
    };
  }

	suggestions(when) {
		when(this.suggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<>You cast something other than <SpellLink id={SPELLS.ARCANE_BLAST.id} /> {this.cast} times. All the other spells in your spellbook are irrelevant, just cast <SpellLink id={SPELLS.ARCANE_BLAST.id} /> until the boss is dead.</>)
					.icon(SPELLS.ARCANE_BLAST.icon)
					.actual(`${this.cast} casts`)
					.recommended(`0 is recommended`);
			});
	}
}

export default AprilFools;
