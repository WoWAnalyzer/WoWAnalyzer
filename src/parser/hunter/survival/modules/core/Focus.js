import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import resourceSuggest from 'parser/shared/modules/resourcetracker/ResourceSuggest';
import FocusTracker from 'parser/hunter/shared/modules/resources/FocusTracker';

class Focus extends Analyzer {
  static dependencies = {
    focusTracker: FocusTracker,
  };

  suggestions(when) {
    resourceSuggest(when, this.focusTracker, {
      spell: SPELLS.KILL_COMMAND_CAST_SV,
      minor: 0.025,
      avg: 0.05,
      major: 0.1,
      extraSuggestion: <>Try to keep focus below max by using <SpellLink id={SPELLS.SERPENT_STING_SV.id} />, <SpellLink id={SPELLS.MONGOOSE_BITE_TALENT.id} /> or <SpellLink id={SPELLS.RAPTOR_STRIKE.id} />.</>,
    });
  }
}

export default Focus;
