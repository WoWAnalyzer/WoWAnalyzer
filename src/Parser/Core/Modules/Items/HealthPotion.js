import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Potion from './Potion';

const SPELL = [
  SPELLS.ASTRAL_HEALING_POTION,
  SPELLS.ANCIENT_HEALING_POTION,
];
const RECOMMENDED_EFFICIENCY = 0.6;

/**
 * Tracks health potion cooldown.
 */

class Healthstone extends Potion {

  constructor(...args) {
    super(...args, SPELL, RECOMMENDED_EFFICIENCY);
  }

  suggestions(when) {
		when(this.suggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<React.Fragment>You used an <SpellLink id={SPELL[0].id} /> {this.potionCasts > 1 || this.potionCasts === 0 ? this.potionCasts + ' times' : this.potionCasts + ' time'} but could have used it {this.maxCasts > 1 ? this.maxCasts + ' times' : this.maxCasts + ' time'}. If you are low on health, make sure you use your health potion and Defensive Abilities to stay alive and to help the healers. </React.Fragment>)
					.icon(SPELL[0].icon);
      });
  }
}

export default Healthstone;
