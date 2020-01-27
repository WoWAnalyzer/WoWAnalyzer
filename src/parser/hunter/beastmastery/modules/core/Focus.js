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
      spell: SPELLS.ASPECT_OF_THE_WILD,
      minor: 0.025,
      avg: 0.05,
      major: 0.1,
      extraSuggestion: <>Try to keep focus below max by using <SpellLink id={SPELLS.COBRA_SHOT.id} /> and <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} />.</>,
    });

    //TODO Implement something to track the various Barbed Shot regenerate events in one resourceSuggest
  }
}

export default Focus;
