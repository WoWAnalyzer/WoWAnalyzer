import React from 'react';
import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import ABILITYTRACKER from 'Parser/Core/Modules/AbilityTracker';
import { calculateMaxCasts } from 'Parser/Core/getCastEfficiency';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import SpellLink from 'common/SpellLink';

const ICEBOUND_FORTITUDE = 180;

class IceboundFortitude extends Module {
  static dependencies = {
    abilityTracker: ABILITYTRACKER,
  };

    suggestions(when) {
      const maxCasts = Math.ceil(calculateMaxCasts(ICEBOUND_FORTITUDE, this.owner.fightDuration));
      const casts = this.abilityTracker.getAbility(SPELLS.ICEBOUND_FORTITUDE.id).casts || 0;
      const percentage = casts / maxCasts;
      when(percentage).isGreaterThanOrEqual(0)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>{casts} out of {maxCasts} <SpellLink id={SPELLS.ICEBOUND_FORTITUDE.id} /> casts. <br /> Defensive CD like this are meant to be used smartly. Use it to smooth regular damage intake or to take the edge of big attacks.</span>)
            .icon(SPELLS.ICEBOUND_FORTITUDE.icon)
            .staticImportance(ISSUE_IMPORTANCE.MINOR);
        });
    }
}

export default IceboundFortitude;
