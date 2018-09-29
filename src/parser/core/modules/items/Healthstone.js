import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Potion from './Potion';

const SPELL = SPELLS.HEALTHSTONE;
const RECOMMENDED_EFFICIENCY = 0.6;

/**
 * Tracks Healthstone cooldown.
 */

class Healthstone extends Potion {

  constructor(...args) {
    super(...args, SPELL, RECOMMENDED_EFFICIENCY);
  }

  suggestions(when) {
		when(this.suggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<React.Fragment>You used a <SpellLink id={SPELLS.HEALTHSTONE.id} /> {this.potionCasts > 1 || this.potionCasts === 0 ? this.potionCasts + ' times' : this.potionCasts + ' time'} but could have used it {this.maxCasts > 1 ? this.maxCasts + ' times' : this.maxCasts + ' time'}. If you are low on health, make sure you use your Healthstone and defensive abilities to stay alive and to help the healers. </React.Fragment>)
					.icon(SPELLS.HEALTHSTONE.icon);
      });
  }
}

export default Healthstone;
