import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import RuneTracker from '../../../Shared/RuneTracker';

class DeathsCaress extends Analyzer {
  static dependencies = {
    tracker: RuneTracker,
  };

  dcCasts = 0;

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.DEATHS_CARESS.id) {
      return;
    }
    this.dcCasts += 1;
  }

  get averageCastSuggestionThresholds() {
    return {
      actual: 1 - (this.dcCasts / (this.tracker.runesMaxCasts - this.tracker.runesWasted)),
      isLessThan: {
        minor: 1,
        average: .95,
        major: .9,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.averageCastSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<React.Fragment>Avoid casting <SpellLink id={SPELLS.DEATHS_CARESS.id} /> unless you're out of melee range and about to cap your runes while <SpellLink id={SPELLS.DEATH_AND_DECAY.id} /> and <SpellLink id={SPELLS.BLOODDRINKER_TALENT.id} /> are on cooldown. Dump runes primarily with <SpellLink id={SPELLS.HEART_STRIKE.id} />.</React.Fragment>)
            .icon(SPELLS.DEATHS_CARESS.icon)
            .actual(`${formatPercentage(this.dcCasts / (this.tracker.runesMaxCasts - this.tracker.runesWasted))}% runes spend with Death's Caress`)
            .recommended(`0% are recommended`);
        });
  }
}

export default DeathsCaress;
