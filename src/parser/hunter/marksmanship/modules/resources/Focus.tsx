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

  protected focusTracker!: FocusTracker;

  suggestions(when: any) {
    resourceSuggest(when, this.focusTracker, {
      spell: SPELLS.STEADY_SHOT_FOCUS,
      minor: 0.025,
      avg: 0.05,
      major: 0.1,
      extraSuggestion: <>Try to keep focus below max by using <SpellLink id={SPELLS.AIMED_SHOT.id} />, <SpellLink id={SPELLS.ARCANE_SHOT.id} /> and <SpellLink id={SPELLS.MULTISHOT_MM.id} />.</>,
    });
    resourceSuggest(when, this.focusTracker, {
      spell: SPELLS.RAPID_FIRE_FOCUS,
      minor: 0.025,
      avg: 0.05,
      major: 0.1,
      extraSuggestion: <>Try to keep focus below max by using <SpellLink id={SPELLS.AIMED_SHOT.id} />, <SpellLink id={SPELLS.ARCANE_SHOT.id} /> and <SpellLink id={SPELLS.MULTISHOT_MM.id} />.</>,
    });
    resourceSuggest(when, this.focusTracker, {
      spell: SPELLS.FOCUSED_FIRE_FOCUS,
      minor: 0.025,
      avg: 0.05,
      major: 0.1,
      extraSuggestion: <>Try to keep focus below max by using <SpellLink id={SPELLS.AIMED_SHOT.id} />, <SpellLink id={SPELLS.ARCANE_SHOT.id} /> and <SpellLink id={SPELLS.MULTISHOT_MM.id} />.</>,
    });
  }
}

export default Focus;
