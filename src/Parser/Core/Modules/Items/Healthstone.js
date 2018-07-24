import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Abilities from 'Parser/Core/Modules/Abilities';
import Potion from './Potion';

const SPELL = [
  SPELLS.HEALTHSTONE,
  SPELLS.ANCIENT_HEALING_POTION,
  SPELLS.ASTRAL_HEALING_POTION,
];
const CATEGORY = Abilities.SPELL_CATEGORIES.DEFENSIVE;
const RECOMMENDED_EFFICIENCY = 0.6;

/**
 * Healthstone/health pot cooldown is one minute, but only starts when the
 * actor is out of combat or dead.
 */

class Healthstone extends Potion {

  constructor(...args) {
    super(...args, SPELL, CATEGORY, RECOMMENDED_EFFICIENCY);
  }

  suggestions(when) {
		when(this.suggestionThresholds)
			.addSuggestion((suggest, actual, recommended) => {
				return suggest(<React.Fragment>You used a <SpellLink id={SPELLS.HEALTHSTONE.id} /> {this.potionCasts > 1 || this.potionCasts === 0 ? this.potionCasts + ' times' : this.potionCasts + ' time'} but could have used it {this.maxCasts > 1 ? this.maxCasts + ' times' : this.maxCasts + ' time'}. If you are low on health, make sure you use your Healthstone and Defensive Abilities to stay alive and to help the healers. </React.Fragment>)
					.icon(SPELLS.HEALTHSTONE.icon);
      });
  }
}

export default Healthstone;
