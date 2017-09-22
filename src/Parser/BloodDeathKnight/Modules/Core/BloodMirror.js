import React from 'react';
import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import ABILITYTRACKER from 'Parser/Core/Modules/AbilityTracker';
import { calculateMaxCasts } from 'Parser/Core/getCastEfficiency';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import SpellLink from 'common/SpellLink';

const BLOOD_MIRROR = 120

class BloodMirror extends Module {
  static dependencies = {
    abilityTracker: ABILITYTRACKER,
  };

    suggestions(when) {
      const maxCasts = Math.ceil(calculateMaxCasts(BLOOD_MIRROR, this.owner.fightDuration));
      const casts = this.abilityTracker.getAbility(SPELLS.BLOOD_MIRROR.id).casts || 0;
      const percentage = casts / maxCasts;
      when(percentage).isGreaterThanOrEqual(0)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>{casts} out of {maxCasts} <SpellLink id={SPELLS.BLOOD_MIRROR.id} /> casts. <br /> Use it to reflect large amounts of damage back unless you have need for its defensive property.</span>)
            .icon(SPELLS.BLOOD_MIRROR.icon)
            .staticImportance(ISSUE_IMPORTANCE.MINOR);
        });
    }
}

export default BloodMirror;
